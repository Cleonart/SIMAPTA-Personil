import prisma from "./prisma";

prisma.endpoint = "/model/v1/surat_tugas_personil";
export default {
  ...prisma,
};
