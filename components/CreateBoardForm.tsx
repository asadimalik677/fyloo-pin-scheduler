"use client";
import { useState } from "react";

export default function CreateBoardForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Creating...");
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(`Error: ${json.error}`);
      return;
    }
    setMessage(`Board created: ${json.board.name}`);
    setName("");
    setDescription("");
    window.location.reload();
  }

  return (
    <form onSubmit={submit}>
      <h2>Create a board</h2>
      <label htmlFor="board-name">Name</label>
      <input id="board-name" value={name} onChange={(e) => setName(e.target.value)} required />
      <label htmlFor="board-desc">Description</label>
      <textarea id="board-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      <button type="submit">Create board</button>
      {message && <p>{message}</p>}
    </form>
  );
}
