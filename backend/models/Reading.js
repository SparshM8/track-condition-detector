// import mongoose from "mongoose";

// // wetnessIndex maps the categorical label onto a number so trend math
// // (moving average, slope) is trivial arithmetic instead of string comparison.
// const LABEL_TO_INDEX = {
//   Dry: 0,
//   Drying: 1,
//   Damp: 2,
//   Wet: 3,
// };

// const readingSchema = new mongoose.Schema({
//   imageUrl: {
//     type: String,
//     required: true,
//   },
//   label: {
//     type: String,
//     enum: ["Dry", "Damp", "Wet", "Drying"],
//     required: true,
//   },
//   wetnessIndex: {
//     type: Number,
//     required: true,
//   },
//   confidence: {
//     type: Number,
//     min: 0,
//     max: 1,
//     default: 0.5,
//   },
//   reasoning: {
//     type: String,
//     default: "",
//   },
//   source: {
//     type: String,
//     enum: ["ai", "heuristic"],
//     default: "ai",
//   },
//   weather: {
//     type: String,
//     default: "",
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now,
//   },
// });

// readingSchema.statics.LABEL_TO_INDEX = LABEL_TO_INDEX;

// const Reading = mongoose.model("Reading", readingSchema);
// export default Reading;

import mongoose from "mongoose";

// wetnessIndex maps the categorical label onto a number so trend math
// (moving average, slope) is trivial arithmetic instead of string comparison.
const LABEL_TO_INDEX = {
  Dry: 0,
  Drying: 1,
  Damp: 2,
  Wet: 3,
};

const readingSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    enum: ["Dry", "Damp", "Wet", "Drying"],
    required: true,
  },
  wetnessIndex: {
    type: Number,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  reasoning: {
    type: String,
    default: "",
  },
  source: {
    type: String,
    enum: ["ai", "heuristic"],
    default: "ai",
  },
  weather: {
    type: String,
    default: "",
  },
  timestamp: {
    // indexed because every history/trend query sorts by this field —
    // without it Mongo has to sort the whole collection in memory,
    // which throws "Sort exceeded memory limit" once the collection grows.
    type: Date,
    default: Date.now,
    index: true,
  },
});

readingSchema.statics.LABEL_TO_INDEX = LABEL_TO_INDEX;

const Reading = mongoose.model("Reading", readingSchema);
export default Reading;