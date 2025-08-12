import React from "react";
import Navbar from "./components/Navbar";
// import Home from "./components/Home";
import DocxPdfConverter from "./components/DocxPdfConverter";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
      <DocxPdfConverter/>
      <Footer />
    </>
  );
}

export default App;