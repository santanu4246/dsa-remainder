"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ContainerScroll } from "../ui/container-scroll-animation";
import Image from "next/image";

export function HeroScrollDemo() {
  const textElementsRef = useRef(null);
  const isInView = useInView(textElementsRef, { once: true, amount: 0.5 });

  return (
    <div className="flex flex-col overflow-hidden items-center justify-start">
      <motion.div
        ref={textElementsRef}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        {/* Dashboard Preview pill in blue */}
        <div className="inline-block border border-blue-500/20 px-4 py-1.5 rounded-full text-sm bg-blue-500/10 text-blue-300 font-medium">
          Dashboard Preview
        </div>

        {/* Heading Section for DSA Dashboard */}
        <div className="text-center max-w-2xl mx-auto mt-8 mb-12">
          <h2 className="text-3xl myfont2 md:text-4xl text-white font-extrabold">
            Master the DSA Arena
          </h2>
          <p className="mt-4 myfont2 text-gray-400 text-sm md:text-lg">
            Track your daily challenges, measure your progress, and refine your
            DSA skills with our interactive dashboard.
          </p>
        </div>
      </motion.div>

      <ContainerScroll>
        <Image
          src={`/dashboard.png`}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
