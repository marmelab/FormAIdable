import { useState } from 'react';
import { TabsSelect } from './components/TabsSelect';
import { Form, FormsList } from './components/FormsList';

function App() {
    const [selectedTab, setSelectedTab] = useState<string | undefined>(
        undefined,
    );

    const [selectedForm, setSelectedForm] = useState<Form | undefined>(
        undefined,
    );

    function handleTabSelect(event: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedTab(event.target.value);
    }

    function handleCancel() {
        window.close();
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
                        <TabsSelect onSelect={handleTabSelect} />
                    </div>

                    <div className="border-b border-gray-900/10 pb-6">
                        <h2 className="text-base/7 font-semibold text-gray-900">
                            Forms Detected
                        </h2>
                        <FormsList
                            selectedForm={selectedForm}
                            setSelectedForm={setSelectedForm}
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        className="text-sm/6 font-semibold text-gray-900 cursor-pointer"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={!selectedForm || !selectedTab}
                    >
                        Fill form
                    </button>
                </div>
            </form>
        </div>
    );
}

export default App;
