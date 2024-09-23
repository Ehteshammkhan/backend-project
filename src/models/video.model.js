import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoShema = new Schema(
  {
    video: {
      type: String, //Cloudnary URL
      required: true,
    },
    thumbnail: {
      type: String, //Cloudnary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Number,
      default: true,
    },
    isPublished: {
      type: Number,
      default: true,
    },
    awner: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

videoShema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoShema);
