import { Download } from "lucide-react";
import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-10">
      <div className="flex justify-center items-center">
        <Image src="/favicon.png" alt="logo" width={70} height={70} />
        <div className="text-bold flex gap-1 text-xl">
          <span className="capitalize">dead link</span>
          <span className="capitalize text-[#248D32] font-(family-name: 'Roboto')">
            graveyard
          </span>
        </div>
      </div>
      <div className="flex gap-5">
        <button className="p-1 border rounded-[5px] px-5 cursor-pointer gap-2 border-black flex justify-between items-center">
          <div>
            <Download size={20} />
          </div>
          <div>Download PNG</div>
        </button>
        <button className="bg-[#DC322A] cursor-pointer p-2 text-white">
          Stop Crawl
        </button>
      </div>
    </div>
  );
};

export default Navbar;
