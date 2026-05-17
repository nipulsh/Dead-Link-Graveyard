import React from "react";

const Header = () => {
  const headerFields = [
    "Pages Crawled",
    "Links Found",
    "Issues Found",
    "In Progress",
  ];

  return (
    <div className="flex justify-between items-center border py-5 mx-4 px-10 mt-4 shadow-[-2px_-2px_6px_rgba(255,255,255,0.05)]">
      <div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-sm">Crawl Status</span>
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-green-500 text-sm">
            Crawling in progress...
          </span>
        </div>
        <div className="text-sm">Link of the website</div>
      </div>
      <div className="flex gap-5">
        {headerFields.map((field, index) => {
          return (
            <div
              key={index}
              className="w-[10vw] flex flex-col gap-2 items-baseline border rounded-sm border-black py-5 px-2"
            >
              <div className="text-[12px]">{field}</div>
              <div>data</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Header;
