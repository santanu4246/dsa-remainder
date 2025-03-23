import GlowingGridBackground from "@/components/grid/grid-bg";
import Herosection from "../components/landing-page/herosection";
export default function Home() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#040609]">
        {/* <GlowingGridBackground /> */}
      </div>
      <Herosection />
    </>
  );
}
