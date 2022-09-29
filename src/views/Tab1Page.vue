<template>
  <ion-page>
    <ion-content :scroll-events="true">
      <TopProfile :user="user" />
      <ion-grid class="ion-padding-horizontal">
        <div class="action-header">
          <h3 class="title">Giat sedang berjalan</h3>
          <ion-spinner
            v-if="loadingState"
            style="position: relative; left: 50%; transform: translateX(-50%)"
          ></ion-spinner>
          <div v-else>
            <p v-if="tasks.length == 0" style="opacity: 0.4; margin-top: 0px">
              Tidak ada giat yang sedang berjalan
            </p>
            <div style="padding-top: 5px; padding-bottom: 5px" v-else>
              <div v-for="item in tasks" :key="item">
                <!-- Surat Tugas -->
                <ion-item
                  v-if="item.type == 'surat_tugas'"
                  style="border-radius: 5px; margin-bottom: 10px"
                >
                  <ion-label>
                    <p style="color: #fff">
                      <b>{{ item.nomor_sprint }}</b>
                    </p>
                    <p style="opacity: 0.9; font-size: 14px; margin-top: 5px">
                      Dimulai pada
                      {{ moment(item.tanggal_mulai).format("DD MMMM YYYY") }}
                      hingga
                      {{ moment(item.tanggal_selesai).format("DD MMMM YYYY") }}
                    </p>
                  </ion-label>
                </ion-item>

                <!-- Patroli -->
                <PatrolCard v-else-if="item.type == 'patroli'" :item="item" />
              </div>
            </div>
          </div>
        </div>
      </ion-grid>
      <ion-item-divider style="min-height: 10px; border-width: 5px">
      </ion-item-divider>
      <ion-grid class="ion-padding-horizontal">
        <div class="action-list">
          <h3 class="title">Giat akan datang</h3>
          <p style="opacity: 0.4; margin-top: 0px">
            Cek giat anda melalui list ini
          </p>
          <ion-spinner
            v-if="loadingState"
            style="position: relative; left: 50%; transform: translateX(-50%)"
          ></ion-spinner>
          <div v-else>
            <ion-item
              v-for="item in surat_tugas"
              v-bind:key="item"
              style="border-radius: 5px"
              class="ion-margin-bottom"
            >
              <ion-label class="ion-text-wrap">
                <div class="ion-margin-bottom">
                  <h4>
                    <ion-chip
                      color="primary"
                      class="ion-margin-bottom"
                      style="margin-left: 0px"
                      >{{ item.surat_tugas.nomor_registrasi }}</ion-chip
                    >
                    <br />
                    <b> Nomor Sprint : {{ item.surat_tugas.nomor_sprint }} </b>
                  </h4>
                </div>
                <p>
                  {{
                    moment(item.surat_tugas.tanggal_mulai).format(
                      "DD MMMM YYYY"
                    )
                  }}
                  -
                  {{
                    moment(item.surat_tugas.tanggal_selesai).format(
                      "DD MMMM YYYY"
                    )
                  }}
                </p>
                <p>
                  Tipe Penugasan :
                  {{ translate[item.surat_tugas.tipe_penugasan] }}
                </p>
                <p>Penugasan Sebagai : {{ translate[item.posisi] }}</p>
                <a href="">
                  <ion-button class="ion-margin-top">Unduh Surat</ion-button>
                </a>
              </ion-label>
            </ion-item>
          </div>
        </div>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { IonPage, IonContent } from "@ionic/vue";
import apiUsePersonil from "../api/usePersonil";
import apiUseSuratTugas from "../api/useSuratTugas";
import apiUsePatroli from "../api/usePatroli";
import TopProfile from "@/components/TopProfile.vue";
import moment from "moment";
import translate from "@/core/translate";
import _ from "underscore";
import PatrolCard from "./components/patroliCard.vue";

export default defineComponent({
  name: "Tab1Page",
  components: {
    TopProfile,
    IonContent,
    IonPage,
    PatrolCard,
  },
  setup() {
    const loadingState = ref(false);
    const user = ref({});
    const surat_tugas = ref([]);
    const current_surat_tugas = ref([]);
    const tasks = ref([]);

    const getUser = async () => {
      loadingState.value = true;
      const refreshToken = localStorage.getItem("refresh_token");
      const userApi = await apiUsePersonil.findMany({
        where: {
          akun: {
            refresh_token: refreshToken,
          },
        },
        include: {
          surat_tugas_ids: {
            include: {
              surat_tugas: true,
            },
            take: 10,
          },
        },
      });
      if (userApi.data) {
        user.value = userApi.data.response.records[0];
        surat_tugas.value = user.value.surat_tugas_ids;
        await getTask();
        setTimeout(() => {
          loadingState.value = false;
        }, 500);
      }
    };

    const getTask = async () => {
      const today = new Date(moment().format("YYYY-MM-DD"));
      const task_list = [];

      // * Get surat tugas task
      const surat_tugas_lines = await apiUseSuratTugas.findMany({
        where: {
          tanggal_mulai: { gte: today },
          tanggal_selesai: { gte: today },
          status: "valid",
          daftar_personil: {
            some: {
              personil_id: user.value.id,
            },
          },
        },
      });

      let records = surat_tugas_lines.data.response.records || [];
      records.forEach((element) => {
        task_list.push({
          ...element,
          type: "surat_tugas",
        });
      });

      // * Get patrol tasks
      const patrol_lines = await apiUsePatroli.findMany({
        where: {
          surat_tugas: {
            daftar_personil: {
              some: {
                personil_id: user.value.id,
              },
            },
          },
          status: { in: ["confirm", "start"] },
          tanggal_rencana_patroli: { gte: today },
        },
        include: {
          surat_tugas: {
            select: {
              daftar_personil: {
                where: {
                  personil_id: user.value.id,
                },
              },
            },
          },
        },
      });

      records = patrol_lines.data.response.records || [];
      records.forEach((element) => {
        task_list.push({
          ...element,
          type: "patroli",
          posisi: element.surat_tugas.daftar_personil[0].posisi,
        });
      });
      tasks.value = task_list;
    };

    onMounted(async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken == undefined) {
        location.href = "/login";
      }
      await getUser();
    });

    return {
      loadingState,
      user,
      surat_tugas,
      current_surat_tugas,
      translate,
      moment,
      tasks,
      getUser,
    };
  },
});
</script>


<style scoped>
.action-header .title::before {
  border-bottom: 10px solid black;
}
</style>