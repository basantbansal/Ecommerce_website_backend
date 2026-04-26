import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    category: {
      type: String,
      index: true,
    },

    brand: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    discountPercentage: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    availabilityStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock"],
      default: "In Stock",
    },

    minimumOrderQuantity: {
      type: Number,
      default: 1,
    },

    // Images
    thumbnail: {
      type: String,
    },

    images: [
      {
        type: String,
      },
    ],

    // Dimensions (nested object)
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
    },

    weight: {
      type: Number,
    },

    // Extra info
    shippingInformation: {
      type: String,
    },

    returnPolicy: {
      type: String,
    },

    warrantyInformation: {
      type: String,
    },

    tags: [
      {
        type: String,
      },
    ],

    sku: {
      type: String,
      unique: true,
    },

    // Reviews (array of objects)
    reviews: [
      {
        rating: Number,
        comment: String,
        reviewerName: String,
        date: Date,
      },
    ],

    // Meta info
    meta: {
      createdAt: Date,
      updatedAt: Date,
      barcode: String,
      qrCode: String,
    },

    // 🔥 VERY IMPORTANT: User who added product
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function () {
  this.availabilityStatus = this.stock > 0 ? "In Stock" : "Out of Stock";
});

export const Product = mongoose.model("Product", productSchema);