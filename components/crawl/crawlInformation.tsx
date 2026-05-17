import { cn } from "@/lib/utils";
import React from "react";

const CrawlInformation = () => {
  const informationFields = {
    "pages founded": {
      name: "pages founded",
      value: 0,
      color: "black",
    },
    "pages crawled": {
      name: "pages crawled",
      value: 0,
      color: "black",
    },
  };
  const errorFields = [
    {
      name: "200 ok",
      value: 0,
      color: "green",
    },
    {
      name: "404 errors",
      value: 0,
      color: "red",
    },
    {
      name: "5xx errors",
      value: 0,
      color: "red",
    },
  ];
  const liveActivityFeed = [
    {
      name: "Page 1",
      value: 0,
      color: "black",
    },
    {
      name: "Page 2",
      value: 0,
      color: "black",
    },
    {
      name: "Page 3",
      value: 0,
      color: "black",
    },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 border-1 border-[#E0E0E0] rounded-md p-2">
        <ul className="flex flex-col gap-2 border-b-1 border-[#E0E0E0] pb-2">
          {Object.values(informationFields).map((field, index) => {
            return (
              <li
                key={index}
                className={cn(
                  "flex justify-between items-center",
                  field.color === "green"
                    ? "text-green-500"
                    : field.color === "red"
                      ? "text-red-500"
                      : "text-black",
                )}
              >
                <span>{field.name}</span>
                <span>{field.value}</span>
              </li>
            );
          })}
        </ul>
        <ul>
          {errorFields.map((field, index) => {
            return (
              <li
                key={index}
                className={cn(
                  "flex justify-between items-center",
                  field.color === "green"
                    ? "text-green-500"
                    : field.color === "red"
                      ? "text-red-500"
                      : "text-black",
                )}
              >
                <span>{field.name}</span>
                <span>{field.value}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-2 border-1 border-[#E0E0E0] rounded-md p-2">
        <div>Live activity feed</div>
        <ul>
          {liveActivityFeed.map((item, index) => {
            return (
              <li key={index}>
                <span>{item.name}</span>
                <span>{item.value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CrawlInformation;
