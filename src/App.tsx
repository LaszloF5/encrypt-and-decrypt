import React, { useState } from "react";
import "./App.css";
import { strict } from "assert";
import { resourceLimits } from "worker_threads";

function App() {
  const [text, setText] = useState<string>("");
  const [isSecret, setIsSecret] = useState<string>("");
  const [isMessage, setIsMessage] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<string>("");
  const [inputSecret, setInputSecret] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [secretInput, setSecretInput] = useState<string>("");


  // Save input

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setText(secretInput);
    setSecretInput("");
    setIsSaved(true);
    setLoading(false);
  };

  // Encrypt message

  const getRandomLetter = (): string => {
    const letters = "abCdEfghIjklMnopQrstuVwxYz";
    let index = Math.floor(Math.random() * letters.length);
    return letters[index];
  }

  const randomPlus = (text: string): string => {
    let result = '';
    for(let i = 0; i < text.length; ++i) {
      result += text[i];
      if(Math.trunc(Math.random() * 10) >= 5) {
        result += getRandomLetter();
      }
    }
    return result;
  }

  const toSecret = (): void => {
    const encoded: string[] = [...text];

    const numEncoded: (number)[] = encoded.map(
      (char, i) => Number(char.charCodeAt(0)) + ((i * 3) % 10)
    );

    let stringFormat = numEncoded.join("-");

    let newMix = randomPlus(stringFormat);

    setIsSecret(newMix);

    setIsSaved(false);
  };

  // Decrypt message

  const fromSecret = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    let cleanCode: string = '';

  for(let i = 0; i < inputSecret.length; ++i) {
    let currSecret = inputSecret[i];
    if((currSecret >= '0' && currSecret <= '9') || currSecret === '-') {
      cleanCode += currSecret;
    }
  }    

    const deCoded: string = cleanCode
      .split("-")
      .map((code, i) => String.fromCharCode(Number(code) - ((i * 3) % 10)))
      .join("");

    const form2 = e.currentTarget;

    (form2.elements.namedItem("fromSecret") as HTMLInputElement).value = "";

    setIsMessage(deCoded);

    setInputSecret("");
  };

  // Copy function
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isSecret);
      setCopySuccess("Message copied successfully.");
      setTimeout(() => {
        setCopySuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setCopySuccess("An error occurred while copying.");
    }
  };

  // Paste function

  const handlePaste = async () => {
    try {
      const textFromClipboard: string = await navigator.clipboard.readText();
      setInputSecret(textFromClipboard);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <h1>Encrypt and decrypt messages</h1>
      <form onSubmit={handleForm}>
        <label htmlFor="secret-id">Type your message </label>
        <input
          type="text"
          name="secret"
          id="secret-id"
          autoFocus
          autoComplete="off"
          value={secretInput}
          onChange={(e) => setSecretInput(e.target.value)}
        />

        {isSaved && (
          <button type="button" onClick={toSecret}>
            To encrypt!
          </button>
        )}
        {!isSaved && (
          <button type="submit">{isLoading ? "Loading" : "Save"}</button>
        )}
      </form>
      <form onSubmit={fromSecret}>
        <label htmlFor="fromSecret-id">Paste or type your code</label>
        <input
          type="text"
          name="fromSecret"
          id="fromSecret-id"
          value={inputSecret}
          autoComplete="off"
          onChange={(e) => setInputSecret(e.target.value)}
        />
        <button type="button" onClick={handlePaste}>
          Paste
        </button>
        <button type="submit">Convert</button>
      </form>
      {isSecret.length > 0 && (
        <p>
          Encrypted text: {isSecret}{" "}
          <button type="button" onClick={handleCopy}>
            Copy to clipboard
          </button>
        </p>
      )}
      <span>{copySuccess}</span>
      {isMessage.length > 0 && <p>Decrypted message: {isMessage}</p>}
    </div>
  );
}

export default App;
