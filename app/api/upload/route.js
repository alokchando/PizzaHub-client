
export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || typeof image === "string") {
      return Response.json(
        { message: "Please select an image." },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return Response.json(
        { message: "Only image files are allowed." },
        { status: 400 }
      );
    }

    if (image.size > 5 * 1024 * 1024) {
      return Response.json(
        { message: "Image must be smaller than 5MB." },
        { status: 400 }
      );
    }

    const uploadData = new FormData();
    uploadData.append("image", image);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return Response.json(
        { message: "Image upload failed." },
        { status: 500 }
      );
    }

    return Response.json({
      imageUrl: result.data.url,
    });

  } catch (error) {
    return Response.json(
      { message: "Something went wrong during image upload." },
      { status: 500 }
    );
  }
}
