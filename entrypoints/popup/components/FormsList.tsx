import { useState, useEffect } from 'react';

type TabsSelectProps = {
    selectedForm: Form | undefined;
    setSelectedForm: any;
};

export type Form = {
    id: string;
    action: string;
    fields: Record<string, string>[];
};

export const FormsList = ({
    selectedForm,
    setSelectedForm,
}: TabsSelectProps) => {
    const [forms, setForms] = useState<Form[]>([]);

    useEffect(() => {
        detectForms();
    }, []);

    function detectForms() {
        browser.tabs.query(
            { active: true, lastFocusedWindow: true },
            async function (selectedTab) {
                if (!selectedTab[0]?.id) {
                    return;
                }
                const results = await browser.scripting.executeScript({
                    target: { tabId: selectedTab[0].id },
                    func: findForms,
                });

                if (!results[0].result) {
                    return;
                }
                setForms(results[0].result);
            },
        );
    }

    function highlightForm(form: Form) {
        setSelectedForm(form);
        browser.tabs.query(
            { active: true, lastFocusedWindow: true },
            async function (selectedTab) {
                if (!selectedTab[0]?.id) {
                    return;
                }
                await browser.scripting.executeScript({
                    target: { tabId: selectedTab[0].id },
                    args: [form.id],
                    func: highlightFormById,
                });
            },
        );
    }

    if (!forms.length) {
        return <p className="text-sm/2 text-gray-600">No forms detected</p>;
    }

    return (
        <ul className="mt-2 space-y-2">
            {forms.map((form) => (
                <li
                    key={form.id}
                    className={`p-2 rounded-md bg-white hover:bg-gray-200  text-gray-600 cursor-pointer ${
                        selectedForm?.id === form.id ? 'bg-yellow-100' : ''
                    }`}
                    onClick={() => highlightForm(form)}
                >
                    {form.id} || {form.action || 'No action detected'}
                </li>
            ))}
        </ul>
    );
};

const highlightFormById = (formId: string) => {
    // Clear previous highlights
    Array.from(document.forms).forEach((form) => {
        form.style.border = '';
    });

    const form =
        document.getElementById(formId) || document.forms[Number(formId)];
    if (form) {
        form.style.border = '2px solid yellow';
        form.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }
};

const findForms = () => {
    const forms = Array.from(document.forms).map((form, index) => ({
        id: form.getAttribute('id') || index.toString(),
        action: form.action,
        fields: Array.from(form.elements)
            .filter(
                (field): field is HTMLInputElement | HTMLTextAreaElement =>
                    (field instanceof HTMLInputElement ||
                        field instanceof HTMLTextAreaElement) &&
                    ![
                        'radio',
                        'checkbox',
                        'file',
                        'button',
                        'submit',
                        'reset',
                        'hidden',
                    ].includes(field.type),
            )
            .map(({ id, name, type, placeholder }) => ({
                id,
                name,
                type,
                placeholder,
            })),
    }));

    return forms;
};
