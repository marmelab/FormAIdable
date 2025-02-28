import { useState } from 'react';
// import { Configuration, OpenAIApi } from 'openai';
import { Form } from '@/entrypoints/popup/components/FormsList';

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

export function useFillForm() {
    const [loading, setLoading] = useState(false);

    async function fillForm(selectedTab: string, selectedForm: Form) {
        setLoading(true);
        try {
            // Step 1: Get all HTML from the selected tab
            const tabHtml = await getTabHtml(selectedTab);

            console.log('tabHtml', tabHtml);

            // // Step 2: Get all fields from the selected form
            // const formFields = selectedForm.fields.map(field => ({
            //     name: field.name,
            //     placeholder: field.placeholder,
            //     id: field.id,
            // }));

            // // Step 3: Create an OpenAI prompt
            // const prompt = createOpenAIPrompt(tabHtml, formFields);

            // // Step 4: Call OpenAI
            // const response = await openai.createCompletion({
            //     model: 'text-davinci-003',
            //     prompt,
            //     max_tokens: 1000,
            // });

            // // Step 5: Fill the selected form with data from OpenAI response
            // const formData = parseOpenAIResponse(response.data.choices[0].text);
            // fillSelectedForm(selectedForm, formData);
        } catch (error) {
            console.error('Error filling form:', error);
        } finally {
            setLoading(false);
        }
    }

    return { fillForm, loading };
}

async function getTabHtml(tabId: string): Promise<string> {
    // Implement logic to get HTML content from the selected tab
    return '<html>...</html>';
}

function createOpenAIPrompt(tabHtml: string, formFields: any[]): string {
    // Implement logic to create OpenAI prompt
    return `Find corresponding data for the following fields in the HTML: ${JSON.stringify(formFields)}. HTML: ${tabHtml}`;
}

function parseOpenAIResponse(responseText: string): any {
    // Implement logic to parse OpenAI response
    return JSON.parse(responseText);
}

function fillSelectedForm(selectedForm: Form, formData: any) {
    // Implement logic to fill the selected form with the data
}
