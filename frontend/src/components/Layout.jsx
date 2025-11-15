import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div>
      {/* Fixed Navbar */}
      <Navbar />

      {/* Page content pushed below navbar */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
