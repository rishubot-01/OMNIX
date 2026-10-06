import api from "./api";

const accountService = {
  /*
   * Deactivate current account
   *
   * PATCH /api/account/deactivate
   *
   * Token api.js automatically Authorization
   * header me bhej dega.
   */
  deactivate: async () => {
    return api.patch("/account/deactivate");
  },

  /*
   * Reactivate current account
   *
   * PATCH /api/account/reactivate
   *
   * Token api.js automatically bhejega.
   */
  reactivate: async () => {
    return api.patch("/account/reactivate");
  },

  /*
   * Permanently delete current account
   *
   * DELETE /api/account/delete
   *
   * Token api.js automatically Authorization
   * header me bhej dega.
   */
  delete: async () => {
    return api.delete("/account/delete");
  },
};

export default accountService;