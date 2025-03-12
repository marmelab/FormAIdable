import { useState } from 'react';
import { OpenAI } from 'openai';
import { Field, Form } from '@/entrypoints/popup/components/FormsList';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

export type Preferences = {
    OPENAI_KEY?: string;
    OPENAI_PROMPT?: string;
    OPENAI_MODEL?: string;
};

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_KEY || '',
    dangerouslyAllowBrowser: true,
});

const EnrichedFieldSchema = z.object({
    name: z.string(),
    placeholder: z.string(),
    id: z.string(),
    associatedValue: z.string(),
});

const EnrichedFieldsSchema = z.object({
    formFields: z.array(EnrichedFieldSchema),
});

type EnrichedFields = z.infer<typeof EnrichedFieldsSchema>;

export function useFillForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | boolean>(false);

    useEffect(() => {
        async function fetchApiKey() {
            const data = await storage.getItem('local:preference');
            const preference = data as Preferences;
            if (preference?.OPENAI_KEY) {
                openai.apiKey = preference.OPENAI_KEY;
            }
        }
        fetchApiKey();
    }, []);

    async function fillForm(
        selectedTab: number | undefined,
        selectedForm: Form | undefined,
    ) {
        if (!selectedTab || !selectedForm) {
            return;
        }
        setLoading(true);
        
        try {
            // Step 1: Get all HTML from the selected tab
            const tabHtml = await getTabHtml(selectedTab);

            // Step 2: sanitize form fields
            const sanitizedFormFields = sanitizeFormFields(selectedForm.fields);

            // Step 3: Call an OpenAI prompt
            const enrichedFields: EnrichedFields = await callOpenAIWithPrompt(
                tabHtml,
                sanitizedFormFields,
            );

            // Step 4: Fill the form with the data
            await fillFormWithEnrichedFields(selectedForm, enrichedFields);
            setError(false);
        } catch (error: any) {
            setError(error);
            console.error('Error filling form:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    return { fillForm, loading, error };
}

const getTabHtml = async (tabId: number): Promise<string> => {
    const result = await browser.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
            return document.body.outerHTML;
        },
    });
    if (!result[0].result) {
        throw new Error('No HTML found');
    }

    return result[0].result as string;
};

const sanitizeFormFields = (formFields: Field[]): Field[] => {
    // return formFields that has at least a name or a placeholder or an id
    return formFields.filter(
        (field) => field.name || field.placeholder || field.id,
    );
};

const callOpenAIWithPrompt = async (
    tabHtml: string,
    formFields: Field[],
): Promise<any> => {
    // 1 token ~= 4 chars in English
    // cut tabHtml from being too long. We dont want to exceed 128000 tokens
    const tabHtmlLength = tabHtml.length;
    const maxTokens = 100000;
    if (tabHtmlLength > maxTokens) {
        const ratio = maxTokens / tabHtmlLength;
        const newLength = Math.floor(tabHtmlLength * ratio);
        tabHtml = tabHtml.substring(0, newLength);
    }

    // Get user prompt preference
    const data = await storage.getItem('local:preference');
    const preference = data as Preferences;
    const prompt = preference?.OPENAI_PROMPT || undefined;
    const model = preference?.OPENAI_MODEL || 'gpt-4o-mini-2024-07-18';

    const completion = await openai.beta.chat.completions.parse({
        model: model,
        messages: [
            {
                role: 'system',
                content: `Your task is to extract and associate relevant values for form fields from the given HTML.
                
                - **Match Priority:**  
                  1. **Direct matches**: Use visible text, labels, placeholders, or default values.  
                  2. **Context-based inference**: Use nearby elements, field naming conventions, and structure.  
                  3. **Logical extrapolation**: If no clear match exists, intelligently infer values based on patterns, similar fields, or commonly associated data.  
    
                - **Flexibility:**  
                  - Do not leave fields empty unless absolutely necessary.  
                  - If multiple possible values exist, choose the **most relevant** based on context.  
                  - If a field is ambiguous, make an educated guess rather than returning nothing.  
    
                - **Goal:**  
                  Return a **complete** and **highly usable** autofill dataset, even if some fields require intelligent extrapolation.`,
            },
            {
                role: 'user',
                content: `Extract the most suitable values for these form fields from the given HTML.  
    
                - **If a direct match exists**, use it.  
                - **If no direct match is found**, infer based on nearby text, labels, and structure.  
                - **If necessary, extrapolate intelligently** from patterns in the document.  
                ${prompt?.trim() ? `-**${prompt}` : undefined}

                **Form Fields:**  
                ${JSON.stringify(formFields)}  
    
                **HTML Document:**  
                ${tabHtml}  
                `,
            },
        ],
        response_format: zodResponseFormat(EnrichedFieldsSchema, 'formFields'),
        temperature: 0.7, // Allows more creative extrapolation
        max_tokens: 3000,
    });

    const enrichedFields = completion.choices[0].message.parsed;
    if (!enrichedFields) {
        throw new Error('No enriched fields found');
    }
    return enrichedFields as EnrichedFields;
};

const fillFormWithEnrichedFields = async (
    selectedForm: Form,
    enrichedFields: EnrichedFields,
): Promise<boolean> => {
    const activeTabs = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
    });

    const tabId = activeTabs[0]?.id;

    if (!tabId) {
        throw new Error('No active tab found');
    }

    const results = await browser.scripting.executeScript({
        target: { tabId: tabId },
        func: (formId, enrichedFields) => {
            try {
                const form =
                    document.getElementById(formId as string) ??
                    document.forms[Number(formId)];

                if (!form) {
                    return false;
                }

                form.style.border = '';

                if (typeof enrichedFields === 'string') {
                    return false;
                }

                enrichedFields.formFields.forEach((enrichedField) => {
                    let currentFormField;
                    if (enrichedField.id && enrichedField.id.trim() !== '') {
                        const sanitizedId = enrichedField.id.replace(
                            /([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,
                            '\\$1',
                        );

                        currentFormField = form.querySelector(
                            `#${sanitizedId}`,
                        );
                    }

                    if (!currentFormField) {
                        currentFormField = form.querySelector(
                            `[name="${enrichedField.name}"]`,
                        );
                    }

                    if (currentFormField) {
                        const inputElement =
                            currentFormField as HTMLInputElement;
                        inputElement.value = enrichedField.associatedValue;

                        // Dispatch input event to trigger any listeners
                        // Used for React controlled components. Thanks copilot!
                        const event = new Event('input', { bubbles: true });
                        inputElement.dispatchEvent(event);
                    }
                });

                return true;
            } catch (error) {
                console.error('Error filling form:', error);
                return false;
            }
        },
        args: [selectedForm.id, enrichedFields],
    });

    if (!results[0].result) {
        throw new Error('Error filling form');
    }

    return true;
};
