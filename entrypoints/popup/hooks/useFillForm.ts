import { useState } from 'react';
import { OpenAI } from 'openai';
import { Form } from '@/entrypoints/popup/components/FormsList';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_KEY,
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
            // Step 2: Get all fields from the selected form
            const formFields = selectedForm.fields.map((field) => ({
                name: field.name,
                placeholder: field.placeholder,
                id: field.id,
            }));

            // sanitize form fields
            const sanitizedFormFields = sanitizeFormFields(formFields);

            // Step 3: Call an OpenAI prompt
            const enrichedFields: EnrichedFields = await callOpenAIWithPrompt(
                tabHtml,
                sanitizedFormFields,
            );

            // Step 4: Fill the form with the data
            await fillFormWithEnrichedFields(selectedForm, enrichedFields);
        } catch (error) {
            console.error('Error filling form:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    return { fillForm, loading };
}

const getTabHtml = async (tabId: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                func: () => {
                    return document.body.outerHTML;
                },
            },
            (results) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else if (!results || !results[0].result) {
                    reject(new Error('No result returned'));
                } else {
                    resolve(results[0].result);
                }
            },
        );
    });
};

const sanitizeFormFields = (formFields: any[]): any[] => {
    // return formFields that has at least a name or a placeholder or an id
    return formFields.filter(
        (field) => field.name || field.placeholder || field.id,
    );
};

const callOpenAIWithPrompt = async (
    tabHtml: string,
    formFields: any[],
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

    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-2024-08-06',
        messages: [
            { role: 'system', content: 'Extract the form field information.' },
            {
                role: 'user',
                content: `Find data that could correspond for the following fields in the HTML. Set it in associatedValue prop. If nothing seems to match, you can extrapolate with other data: ${JSON.stringify(
                    formFields,
                )}. HTML: ${tabHtml}`,
            },
        ],
        response_format: zodResponseFormat(EnrichedFieldsSchema, 'formFields'),
        temperature: 0.5,
        max_tokens: 3000,
    });

    const enrichedFields = completion.choices[0].message.parsed;
    if (!enrichedFields) {
        throw new Error('No enriched fields found');
    }
    console.log('Enriched fields:', enrichedFields);
    return enrichedFields as EnrichedFields;
};

const fillFormWithEnrichedFields = async (
    selectedForm: Form,
    enrichedFields: EnrichedFields,
): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query(
            { active: true, lastFocusedWindow: true },
            function (selectedTab) {
                if (!selectedTab[0]?.id) {
                    return;
                }
                chrome.scripting.executeScript(
                    {
                        target: { tabId: selectedTab[0].id },
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

                                enrichedFields.formFields.forEach(
                                    (enrichedField) => {
                                        let currentFormField;
                                        if (
                                            enrichedField.id &&
                                            enrichedField.id.trim() !== ''
                                        ) {
                                            const sanitizedId =
                                                enrichedField.id.replace(
                                                    /([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,
                                                    '\\$1',
                                                );

                                            currentFormField =
                                                form.querySelector(
                                                    `#${sanitizedId}`,
                                                );
                                        }

                                        if (!currentFormField) {
                                            currentFormField =
                                                form.querySelector(
                                                    `[name="${enrichedField.name}"]`,
                                                );
                                        }

                                        if (currentFormField) {
                                            (
                                                currentFormField as HTMLInputElement
                                            ).value =
                                                enrichedField.associatedValue;
                                        }
                                    },
                                );

                                return true;
                            } catch (error) {
                                console.error('Error filling form:', error);
                                return false;
                            }
                        },
                        args: [selectedForm.id, enrichedFields],
                    },
                    (results) => {
                        if (!results[0].result) {
                            reject(new Error('Error filling form'));
                        }

                        resolve(true);
                    },
                );
            },
        );
    });
};
