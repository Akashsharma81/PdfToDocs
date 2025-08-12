import React from "react";

function Navbar() {
  return (
    <>
      <div className="max-w-screen-2xl mx-auto container px-6 py-3 md:px-40 shadow-lg h-16 fixed bg-white">
        <div className="flex justify-between items-center h-full">
          <h1 className="text-2xl font-roboto cursor-pointer font-bold">
            {/* PDF aur DOCS ke liye black se blue se green gradient */}
            <span className="bg-gradient-to-r from-black via-blue-600 to-green-500 text-transparent bg-clip-text">
              PDF
            </span>
            {/* To ke liye thoda badi size aur same gradient */}
            <span className="text-3xl font-extrabold bg-gradient-to-r from-black via-blue-600 to-green-500 text-transparent bg-clip-text mx-1">
              To
            </span>
            <span className="bg-gradient-to-r from-black via-blue-600 to-green-500 text-transparent bg-clip-text">
              DOCS
            </span>
          </h1>
        </div>
      </div>
    </>
  );
}

export default Navbar;
