import prisma from "./prisma";
import HTTP from "./commonHTTP";

prisma.endpoint = "/model/v1/absensi";
export default {
  ...prisma,
  absenViaQr: function ({ kodeQr = null, token = null }) {
    return HTTP.post(this.endpoint + "/absenViaQr", {
      params: {
        qr: kodeQr,
        token: token,
      },
    });
  },
  absenViaToken: function ({ absent_token = null, jwt_token = null }) {
    return HTTP.post(this.endpoint + "/absenViaToken", {
      params: {
        absent_token: absent_token,
        jwt_token: jwt_token,
      },
    });
  },
};
