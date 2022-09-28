<template>
  <ion-page>
    <ion-content :scroll-events="true">
      <TopProfile :user="user" />
      <ion-grid class="ion-padding-horizontal">
        <div class="action-header">
          <h3 class="title">Giat hari ini</h3>
          <p>Tidak ada giat untuk anda pada hari ini</p>
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
          <ion-item
            v-for="item in surat_tugas"
            v-bind:key="item"
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
                Tanggal Mulai :
                {{
                  moment(item.surat_tugas.tanggal_mulai).format("DD MMMM YYYY")
                }}
              </p>
              <p>
                Tanggal Selesai :
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
              <ion-button class="ion-margin-top">Unduh Surat</ion-button>
            </ion-label>
          </ion-item>
        </div>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { IonPage, IonContent } from "@ionic/vue";
import apiUsePersonil from "../api/usePersonil";
import TopProfile from "@/components/TopProfile.vue";
import moment from "moment";
import translate from "@/core/translate";

export default defineComponent({
  name: "Tab1Page",
  components: {
    TopProfile,
    IonContent,
    IonPage,
  },
  setup() {
    const loadingState = ref(false);
    const user = ref({});
    const surat_tugas = ref([]);

    const getUser = async () => {
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
      }
    };

    onMounted(async () => {
      await getUser();
    });

    return {
      user,
      surat_tugas,
      translate,
      moment,
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