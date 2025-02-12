export interface JSONData {
  deckname: string;
  content: Flashcard[];
}
export interface Flashcard {
  id?: number;
  Front: string;
  Back: string;
}

export type Result<T> = {
  data: T | null;
  error: Error | null;
};

const UrlPrefix = "http://192.168.73.42:8080";
export async function fetchFlashcards(
  deckname: string
): Promise<Result<Flashcard[]>> {
  //make update= to setFlashcard
  // setLoading(true); // Start loading

  const response = await fetch(
    UrlPrefix + "/api/flashcards/decks/" + deckname,
    { credentials: "include" }
  );
  switch (response.status) {
    case 200:
      return { data: (await response.json()) as Flashcard[], error: null };
    case 401:
      return { data: null, error: new Error("go back to auth") };
    default:
      return {
        data: null,
        error: new Error(
          `HTTP error: ${response.status} ${response.statusText}`
        ),
      };
  }
}
export async function updateMultipleFlashcards(
  payloads: UpdatePayload[]
): Promise<Error | null> {
  if (payloads.length == 1) {
    const error = await updateFlashcards(payloads[0]);
    if (error !== null) {
      return error;
    }
    return null;
  }
  try {
    for (const payload of payloads) {
      const error = await updateFlashcards(payload);
      if (error !== null) {
        return error;
      }
      
    }
    return null;
  } catch (error) {
    return new Error(`Error when updating multiple flashcards ${error}`);
  }
}
export async function deleteDeck(deckname: string): Promise<Error | null> {
  const response = await fetch(UrlPrefix + "/api/flashcards/decks/update", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Deckname: deckname }),
  });

  if (!response.ok) {
    if (response.status == 401) {
      return new Error("go back to auth");
    }
    return new Error(
      `HTTP error! status: ${response.status} text:${await response.text()}`
    );
  }
  return null;
}
export type UpdatePayload = {
  deckname: string | undefined;
  flashcard: Flashcard;
};
function isUpdatePayload(
  payload: UpdatePayload | { Deckname: string }
): boolean {
  return "deckname" in payload && "flashcard" in payload;
}
export async function updateFlashcards(
  payload: UpdatePayload | { Deckname: string }
): Promise<Error | null> {
  const response = await fetch(
    UrlPrefix +
      (isUpdatePayload(payload)
        ? "/api/flashcards/update"
        : "/api/flashcards/decks/update"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials:"include"
    }
  );

  if (!response.ok) {
    if (response.status == 401) {
      return new Error("go back to auth");
    }
    return new Error(
      `HTTP error! status: ${response.status} text:${await response.text()}`
    );
  }
  return null;
}
export async function fetchDecks(): Promise<Result<string[]>> {
  try {
    const response = await fetch(UrlPrefix + "/api/flashcards/decks", {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status == 401) {
        return { data: null, error: new Error("go back to auth") };
      }
      return {
        data: null,
        error: new Error(`HTTP error! Status: ${response.status}`),
      };
    }

    const data = JSON.parse(await response.text());
    return { data: data, error: null };
  } catch (error) {
    alert("Request error:" + error);

    return { data: null, error: error as Error };
  }
}
export async function updateDecks(newDeckName: string): Promise<Error | null> {
  try {
    const response = await fetch(UrlPrefix + "/api/flashcards/decks/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include",
      body: JSON.stringify({ Deckname: newDeckName }),
    });

    if (!response.ok) {
      if (response.status == 401) {
        return new Error("go back to auth");
      }
      return new Error(
        `HTTP error! status: ${response.status} text:${await response.text()}`
      );
    }
    return null;
  } catch (error) {
    alert("Request error:" + error);
    return new Error(`Error when making POST request ${error}`);
  }
}
export async function promptRequest(
  text: string
): Promise<Result<Flashcard[]>> {
  if (text === "") {
    throw new Error("Prompt text is empty");
  }
  const formData = new FormData();
  formData.append("text", text);

  const response = await fetch(UrlPrefix + "/api/flashcards/ai-generated", {
    method: "POST",
    body: formData,
    credentials:"include"
  });
  if (!response.ok) {
    if (response.status == 401) {
      return { data: null, error: new Error("go back to auth") };
    }
    alert("Request error:" + (await response.text()));
    const err = new Error(`HTTP error! status: ${response.status}`);
    return { data: null, error: err };
  }
  const result = (await response.json()) as Flashcard[];
  console.log(result);
  return { data: result, error: null };
}

export async function deleteFlashcard(payload: {
  FlashcardToRemove: Flashcard;
  deckname: string;
}): Promise<Error | null> {
  try {
    const response = await fetch(UrlPrefix + "/api/flashcards/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      new Error("go back to auth");
      return new Error(
        `HTTP error! status: ${response.status} text:${await response
          .text()
          .then((text) => {
            return text;
          })}`
      );
    }
    return null;
  } catch (error) {
    alert("Request error:" + error);
    return new Error(`Error when making DELETE request ${error}`);
  }
}
export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  cpassword: string;
};
export type LoginPayload = { username: string; password: string };
export async function registerRequest(
  payload: RegisterPayload
): Promise<number> {
  try {
    const response = await fetch(UrlPrefix + "/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response.status;
    //it should return 202 if successfull
  } catch (error) {
    console.log(error);
    return 0;
  }
}
export async function loginRequest(payload: LoginPayload): Promise<number> {
  try {
    const response = await fetch(UrlPrefix + "/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include", // This is important to include cookies in the request
    });
    alert(await response.text())
    //it should return 202 if login is successfull
    return response.status;
  } catch (error ) {
    console.log(error);
    return 0;
  }
}
