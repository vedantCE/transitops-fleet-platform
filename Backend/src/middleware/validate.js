// source: "body" (default) validates/replaces req.body.
// source: "query" validates req.query but writes the parsed result to
// req.validatedQuery instead of req.query — Express 5 exposes req.query as a
// getter-only property, so reassigning it throws.
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const target = source === "query" ? req.query : req.body;
    const result = schema.safeParse(target);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || source}: ${issue.message}`)
        .join("; ");
      return res.status(400).json({ success: false, message });
    }

    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req.body = result.data;
    }
    next();
  };

module.exports = validate;
