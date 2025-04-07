import { storage } from 'wxt/storage';

document
    .getElementById('options-form')
    .addEventListener('submit', async function (event) {
        event.preventDefault();
        const openAiToken = document.getElementById('openai-token').value;
        const openAiPrompt = document.getElementById('openai-prompt').value;
        await storage.setItem('local:preference', {
            OPENAI_KEY: openAiToken,
            OPENAI_PROMPT: openAiPrompt,
        });
        showToast();
    });

document.addEventListener('DOMContentLoaded', async function () {
    const data = await storage.getItem('local:preference');
    console.log('data', data);
    if (data) {
        if (data.OPENAI_KEY && data.OPENAI_KEY.trim() !== '') {
            document.getElementById('openai-token').value = data.OPENAI_KEY;
        }
        if (data.OPENAI_PROMPT && data.OPENAI_PROMPT.trim() !== '') {
            document.getElementById('openai-prompt').value = data.OPENAI_PROMPT;
        }
    }
});

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
