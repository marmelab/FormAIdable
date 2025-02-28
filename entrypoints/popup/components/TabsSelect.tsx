import React, { useState, useEffect } from 'react';

interface TabsSelectProps {
    onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const TabsSelect = ({ onSelect }: TabsSelectProps) => {
    const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
    const [selectedTab, setSelectedTab] = useState<string | undefined>(
        undefined,
    );

    useEffect(() => {
        chrome.tabs.query({}, (tabs) => {
            chrome.tabs.query(
                { active: true, currentWindow: true },
                (currentTab) => {
                    const filteredTabs = tabs.filter(
                        (tab) => tab.id !== currentTab[0].id,
                    );
                    setTabs(filteredTabs);
                },
            );
        });
    }, []);

    function handleTabSelect(event: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedTab(event.target.value);
        onSelect(event);
    }

    if (!tabs.length) {
        return <p className="mt-2 text-sm/2 text-gray-600">No other tabs detected</p>;
    }
    return (
        <div className="mt-2 grid grid-cols-1">
            <select
                id="tab-select"
                value={selectedTab}
                onChange={handleTabSelect}
                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline -outline-offset-1 outline-gray-300 focus:outline focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                    fillRule="evenodd"
                    d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                />
            </svg>
        </div>
    );
};
