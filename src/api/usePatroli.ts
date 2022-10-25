import prisma from "./prisma";

prisma.endpoint = "/model/v1/patroli";
export default {
  ...prisma,
  start_patrol: function ({ id = undefined }) {
    return this.http.post(this.endpoint + "/start_patrol", {
      params: {
        id: id,
      },
    });
  },
  end_patrol: function ({ id = undefined }) {
    return this.http.post(this.endpoint + "/end_patrol", {
      params: {
        id: id,
      },
    });
  },
};
