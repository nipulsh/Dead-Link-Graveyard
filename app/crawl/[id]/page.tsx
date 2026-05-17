import Graph from "@/components/crawl/Graph";
import Header from "@/components/crawl/Header";
import Navbar from "@/components/crawl/Navbar";

const page = () => {
  return (
    <div className="flex h-screen min-h-0 flex-col bg-[#FEFEFE]">
      <div className="min-h-0 flex-1 overflow-auto">
        <Navbar />
      </div>
      <div className="min-h-0 flex-[1] overflow-auto">
        <Header />
      </div>
      <div className="min-h-0 flex-[9] overflow-hidden">
        <Graph />
      </div>
    </div>
  );
};

export default page;
