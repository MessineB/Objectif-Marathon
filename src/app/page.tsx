export default function Home() {
  return (
    <main>
      <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
    </main>
  );
}
