import { connectX } from "@/app/actions/x";

export default function ConnectXPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Connect your X account</h1>

      <form action={connectX} className="mt-6 flex flex-col gap-4 max-w-sm">
        <input
          type="text"
          name="username"
          placeholder="Your X username"
          className="border p-3"
          required
        />

        <button type="submit" className="bg-black p-3 text-white">
          Connect X
        </button>
      </form>
    </main>
  );
}