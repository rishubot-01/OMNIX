import {
  useState,
} from "react";

import reportService from "../services/report.service";

function Report() {
  const [reason, setReason] =
    useState("spam");

  const [description, setDescription] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setSubmitting(true);
      setSuccess(false);

      try {
        await reportService.createReport({
          reason,
          description,
        });

        setSuccess(true);
        setDescription("");
      } catch (error) {
        console.error(
          "Report error:",
          error
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Report
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Help us keep OMNIX safe and respectful.
        </p>
      </div>

      {success && (
        <div className="mb-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          Your report has been submitted successfully.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6"
      >
        <label className="mb-2 block text-sm font-semibold">
          Reason
        </label>

        <select
          value={reason}
          onChange={(event) =>
            setReason(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
        >
          <option value="spam">
            Spam
          </option>

          <option value="harassment">
            Harassment
          </option>

          <option value="hate">
            Hate speech
          </option>

          <option value="violence">
            Violence
          </option>

          <option value="nudity">
            Nudity
          </option>

          <option value="fake">
            Fake information
          </option>

          <option value="other">
            Other
          </option>
        </select>

        <label className="mb-2 mt-5 block text-sm font-semibold">
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          rows={6}
          placeholder="Tell us what happened..."
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
        />

        <button
          type="submit"
          disabled={
            submitting ||
            !description.trim()
          }
          className="mt-5 w-full rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

export default Report;