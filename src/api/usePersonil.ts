import prisma from "./prisma";

prisma.endpoint = "/model/v1/personil";
export default {
  ...prisma,
};
