# FormAIdable

FormAIdable enhances form interactions on web pages by enabling autocomplete functionality using data from another Chrome tab.

![formAidable](image.png)

## 🚀 Features

-   Autofill web forms using data from another tab
-   Supports `input` and `textarea` elements (more input types to be added)
-   Lightweight and easy to integrate

## 🛠️ Setup Instructions for End Users
To use this extension, you need to configure it with your OpenAI API key, model, and an optional custom prompt. Follow these steps to set it up:

1. **Install the Extension**:
- Go to the browser extension store and install the "Form Filler Extension".

2. **Open Extension Options**:
- Click on the extension icon in your browser toolbar.
- Select "Options" from the dropdown menu.

3. **Configure API Key**:
- In the options page, you will see a field labeled "OpenAI API Key".
- Enter your OpenAI API key in this field. This key is required for the extension to function.

4. **Select Model**:
- In the options page, you will see a field labeled "OpenAI Model".
- Enter the model you wish to use (e.g., gpt-4o-mini-2024-07-18).

5. **Custom Prompt (Optional)**:
In the options page, you will see a field labeled "Custom Prompt".
You can enter a custom prompt to tailor the behavior of the form filling. This field is optional.

6. **Save Settings**:
- After entering the required information, click the "Save" button to store your settings.

7. **Using the Extension**:
- Navigate to the web page with the form you want to fill.
- Click on the extension icon and select the form you want to autofill.
- The extension will use the configured OpenAI API key and model to fetch data and fill the form.

By following these steps, you can easily set up and use the "FormAIdable" to automate form filling on web pages. If you encounter any issues, please refer to the troubleshooting section or contact support.


![live example](demo-extension.gif)

## 📦 Installation 

Ensure you have **Node.js** and **npm** installed before proceeding.

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/formAIdable.git
    ```
2. **Navigate to the project directory:**
    ```sh
    cd formAIdable
    ```
3. **Install dependencies:**
    ```sh
    npm install
    ```

## 🚀 Usage

Setting the OpenAI API Token by creating a .env file in the project root and add

```sh
VITE_OPENAI_KEY=
```

Start the development server with:

```sh
npm run dev
```



## 🛠️ Planned Improvements

This project is in its early stages, and several enhancements are needed:

-   **Better form detection** for more accurate autofill
-   **Support for standalone inputs** (not wrapped inside a `<form>`)
-   **Handling all input types** beyond `input` and `textarea`
-   **Codebase improvements** (initial version focused on speed, now refining quality)

## 🤝 Contributing

We welcome contributions! Feel free to submit issues, suggestions, or pull requests to help improve FormAIdable.

## 🛠️ Built With

-   **wxt**:An open source tool that makes web extension development faster than ever before.
-   **OpenAI SDK**: Utilized for integrating advanced AI functionalities.

## 📜 License

This project is licensed under the **MIT License**.

## ✨ Contributors

-   [Anthony RIMET](https://www.linkedin.com/in/anthonyrimet/)
-   [Marmelab](https://marmelab.com/)
