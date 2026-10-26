"use client";
import { useEffect, useState } from "react";

interface Board {
  id: string;
  name: string;
}

export default function ComposePage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardId, setBoardId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/boards")
      .then((r) => r.json())
      .then((j) => {
        setBoards(j.boards ?? []);
        if (j.boards?.length) setBoardId(j.boards[0].id);
      })
      .catch(() => setMessage("Could not load boards. Connect Pinterest first."));
  }, []);

  function buildForm(): FormData | null {
    if (!image) {
      setMessage("Choose an image first.");
      return null;
    }
    const form = new FormData();
    form.append("image", image);
    form.append("board_id", boardId);
    form.append("title", title);
    form.append("description", description);
    form.append("tags", tags);
    form.append("link", link);
    return form;
  }

  async function publishNow(e: React.FormEvent) {
    e.preventDefault();
    const form = buildForm();
    if (!form) return;
    setMessage("Publishing...");
    const res = await fetch("/api/pins", { method: "POST", body: form });
    const json = await res.json();
    setMessage(res.ok ? `Published. Pin id: ${json.pin?.id}` : `Error: ${json.error}`);
  }

  async function addToQueue(e: React.FormEvent) {
    e.preventDefault();
    const form = buildForm();
    if (!form || !scheduledAt) {
      setMessage("Choose an image and a schedule date/time.");
      return;
    }
    form.append("scheduled_at", new Date(scheduledAt).toISOString());
    setMessage("Adding to queue...");
    const res = await fetch("/api/queue", { method: "POST", body: form });
    const json = await res.json();
    setMessage(res.ok ? "Added to queue." : `Error: ${json.error}`);
  }

  return (
    <div>
      <h1>Composer</h1>
      <form>
        <label htmlFor="board">Board</label>
        <select id="board" value={boardId} onChange={(e) => setBoardId(e.target.value)} required>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <label htmlFor="image">Image</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          required
        />
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label htmlFor="tags">Tags (comma separated)</label>
        <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        <label htmlFor="link">Destination link</label>
        <input id="link" value={link} onChange={(e) => setLink(e.target.value)} />
        <label htmlFor="scheduled">Schedule date and time</label>
        <input
          id="scheduled"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <button onClick={publishNow}>Publish now</button>
        <button type="button" className="secondary" onClick={addToQueue}>
          Add to queue
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
