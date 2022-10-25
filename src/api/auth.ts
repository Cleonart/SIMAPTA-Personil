import HTTP from "./commonHTTP";

export default {
  endpoint: "/auth/v1",

  /**
   * Function untuk login
   * @param {*} nama_pengguna
   * @param {*} kata_sandi
   * @returns
   */
  login: function (
    nama_pengguna: string,
    kata_sandi: string,
    device_id: string
  ) {
    return HTTP.post(this.endpoint + "/login_device", {
      params: {
        nama_pengguna: nama_pengguna,
        kata_sandi: kata_sandi,
        device_id: device_id,
      },
    });
  },

  check_page_authorization: function (token: string, permission: string) {
    return HTTP.post(this.endpoint + "/check_page_authorization", {
      params: {
        token: token,
        permission: permission,
      },
    });
  },

  check_authorized_page: function (token: string) {
    return HTTP.post(this.endpoint + "/check_authorized_page", {
      params: {
        token: token,
      },
    });
  },
};
