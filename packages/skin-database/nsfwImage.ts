import * as tf from "@tensorflow/tfjs-node";
import { load as nsfwLoad } from "nsfwjs";
import path from "path";
import fs from "fs";

const modelPromise = nsfwLoad();

export type NsfwPrediction = {
  porn: number;
  neutral: number;
  sexy: number;
  hentai: number;
  drawing: number;
};

export async function analyseBuffer(buffer: Buffer): Promise<NsfwPrediction> {
  const model = await modelPromise;
  const image = await tf.node.decodePng(buffer, 3);
  const predictions = await model.classify(image);
  if (predictions.length < 5) {
    throw new Error("Not enough predictions found");
  }

  // @ts-ignore
  const obj: NsfwPrediction = {};
  predictions.forEach((prediction) => {
    obj[prediction.className.toLowerCase()] = prediction.probability;
  });
  return obj;
}
