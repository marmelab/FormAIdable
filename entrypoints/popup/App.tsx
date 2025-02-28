import { useState, useEffect } from 'react';

function App() {
    const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
    const [selectedTab, setSelectedTab] = useState<string | undefined>(
        undefined,
    );
    const [forms, setForms] = useState<
        { id: string; action: string; fields: Record<string, string>[] }[]
    >([]);
    useEffect(() => {
        chrome.tabs.query({}, (tabs) => {
            chrome.tabs.query(
                { active: true, currentWindow: true },
                (currentTab) => {
                    const filteredTabs = tabs.filter(
                        (tab) => tab.id !== currentTab[0].id,
                    );
                    setTabs(filteredTabs);
                    if (!currentTab[0]?.id) {
                        return;
                    }
                    detectForms(currentTab[0].id);
                },
            );
        });
    }, []);

    function detectForms(tabId: number) {
        chrome.scripting.executeScript(
            {
                target: { tabId },
                func: () => {
                    const forms = Array.from(document.forms).map(
                        (form, index) => ({
                            id: form.id || index.toString(),
                            action: form.action,
                            fields: Array.from(form.elements).map((field) => ({
                                id: field.id,
                                name: (field as HTMLInputElement).name,
                                type: (field as HTMLInputElement).type,
                            })),
                        }),
                    );
                    console.log('forms', forms);
                    return forms;
                },
            },
            (results) => {
                if (!results[0].result) {
                    return;
                }
                setForms(results[0].result);
            },
        );
    }

    function handleTabSelect(event: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedTab(event.target.value);
    }

    return (
        <div className="mx-auto min-w-lg max-w-7xl p-6">
            <form>
                <div className="space-y-6">
                    <div className="border-b border-gray-900/10 pb-6">
                        <h2 className="text-base/7 font-semibold text-gray-900">
                            Tab2Form
                        </h2>
                        <p className="mt-1 text-sm/6 text-gray-600">
                            Fill your form directly from a tab. Awesome!
                        </p>
                    </div>

                    <div className="border-b border-gray-900/10 pb-6">
                        <h2 className="text-base/7 font-semibold text-gray-900">
                            Tabs Choice
                        </h2>

                        <div className="mt-2 grid grid-cols-1">
                            <select
                                id="tab-select"
                                defaultValue={selectedTab}
                                onChange={handleTabSelect}
                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            >
                                {tabs.map((tab) => (
                                    <option key={tab.id} value={tab.id}>
                                        {tab.title}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="border-b border-gray-900/10 pb-6">
                        <h2 className="text-base/7 font-semibold text-gray-900">
                            Forms Detected
                        </h2>
                        <ul className="mt-2 space-y-2">
                            {forms.map((form) => (
                                <li key={form.id} className={`p-2 rounded-md`}>
                                    {form.id} - {form.action}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        className="text-sm/6 font-semibold text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Fill form
                    </button>
                </div>
            </form>
        </div>
    );
}

export default App;
