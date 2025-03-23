"use client";

import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Inter } from "next/font/google";
import { motion } from "framer-motion";

import { Button } from "../ui/button";
import Link from "next/link";

import BlurIn from "../ui/blur-in";
import AnimatedShinyText from "../ui/animated-shiny-text";
// import { Spotlight } from "../ui/spotlight";
import { Spotlight } from "../ui/spotlight-new";
const inter = Inter({ subsets: ["latin"] });

export default function Component() {
  const contentRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className={`relative w-full flex justify-center overflow-hidden h-screen ${inter.className}`}
    >
      {/* <Spotlight className="top-10 left-0 md:left-60 md:-top-20" fill="white" /> */}
      <Spotlight/>
      <motion.div
        ref={contentRef}
        className="container flex h-[60vh] md:min-h-[75vh] max-w-6xl flex-col items-center pt-32 px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="mb-16 inline-flex items-center rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1"
        >
          <div className="relative mr-2 flex items-center">
            <div className="absolute size-2 animate-ping rounded-full bg-blue-400/60"></div>
            <div className="relative size-2 rounded-full bg-blue-400"></div>
          </div>
          <AnimatedShinyText className="transition-transform ease-out duration-300 hover:text-neutral-600 dark:hover:text-neutral-400">
            <span className="mr-2 text-sm text-blue-400">Master DSA Daily</span>
          </AnimatedShinyText>
          <Button
            variant="ghost"
            className="h-6 items-center gap-1 rounded-full px-2 py-0 text-sm text-gray-400 hover:bg-gray-900 hover:text-gray-300"
          >
            How It Works
            <ArrowRight className="h-3 w-3" />
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <BlurIn
            word="Elevate Your DSA Skills"
            className="myfont mb-6 max-w-4xl text-5xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 md:text-6xl lg:text-7xl"
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mb-12 myfont2 max-w-2xl text-lg text-gray-400 md:text-xl"
        >
          Choose your favorite DSA topic and difficulty level. Every day,
          receive a fresh challenge question in your inbox to help sharpen your
          skills and boost your coding journey.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link href={"/login"}>
            <Button
              size="lg"
              className="h-12 rounded-lg bg-blue-500 px-8 text-base text-white hover:bg-blue-600"
            >
              Set Preferences
            </Button>
          </Link>
          {/* <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-lg border-gray-800 bg-transparent px-8 text-white"
          >
            Subscribe Now
          </Button> */}
        </motion.div>
      </motion.div>
    </section>
  );
}
