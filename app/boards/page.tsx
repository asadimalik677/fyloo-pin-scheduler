import { listBoards } from "../../lib/pinterest";
import CreateBoardForm from "../../components/CreateBoardForm";

export const dynamic = "force-dynamic";

export default async function BoardsPage() {
  let boards: { id: string; name: string; pin_count?: number }[] = [];
  let error: string | null = null;
  try {
    boards = await listBoards();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load boards";
  }
  return (
    <div>
      <h1>Boards</h1>
      {error ? (
        <p className="error">{error} Connect Pinterest first on the Connect page.</p>
      ) : boards.length === 0 ? (
        <p>No boards yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Pins</th>
            </tr>
          </thead>
          <tbody>
            {boards.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.pin_count ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <CreateBoardForm />
    </div>
  );
}
