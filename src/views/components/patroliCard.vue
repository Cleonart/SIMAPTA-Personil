<template>
  <ion-loading :is-open="loading"></ion-loading>

  <!-- Patroli -->
  <ion-item style="margin-bottom: 10px; border-radius: 5px">
    <ion-label>
      <p style="color: white">
        Nomor Patroli : <b>{{ item.nomor_patroli }}</b>
      </p>

      <p>
        Tanggal Rencana :
        {{ moment(item.tanggal_rencana_patroli).format("DD MMMM YYYY") }}
      </p>
      <p>
        Waktu Mulai Aktual :
        {{
          moment(item.patroli_tanggal_mulai).format("DD MMMM YYYY") +
            " pukul " +
            item.patroli_waktu_mulai || "Belum tersedia"
        }}
      </p>

      <!-- Status Patroli -->
      <div v-if="item.status == 'confirm'" style="margin-top: 10px">
        <ion-chip color="danger">Belum Dimulai</ion-chip>
        <ion-button
          v-if="item.posisi == 'katim'"
          @click="startPatrol"
          style="margin-top: -5px"
          size="small"
        >
          Mulai Giat
        </ion-button>
      </div>

      <div v-else-if="item.status == 'start'">
        <ion-chip color="warning"> Sedang Berjalan </ion-chip>
        <div>
          <ion-button
            size="small"
            @click="endPatrol"
            color="danger"
            v-if="item.posisi == 'katim'"
          >
            Akhiri Giat
          </ion-button>
          <ion-button size="small" color="primary">
            Tambahkan Temuan
          </ion-button>
        </div>
      </div>
    </ion-label>
  </ion-item>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import {
  IonItem,
  IonLabel,
  IonChip,
  IonButton,
  IonLoading,
  alertController,
  toastController,
} from "@ionic/vue";
import moment from "moment-timezone";
import apiUsePatroli from "@/api/usePatroli";

export default defineComponent({
  components: {
    IonItem,
    IonLabel,
    IonChip,
    IonButton,
    IonLoading,
  },
  props: ["item"],
  setup(props) {
    const loading = ref(false);
    const startPatrol = async () => {
      const alert = await alertController.create({
        header: "Anda yakin?",
        message: "Anda yakin ingin memulai giat patroli?",
        buttons: [
          {
            text: "Batal",
            role: "cancel",
          },
          {
            text: "Mulai",
            role: "confirm",
            handler: async () => {
              loading.value = true;
              try {
                await apiUsePatroli.start_patrol({
                  id: parseInt(props.item.id),
                });

                const toast = await toastController.create({
                  message: "Berhasil memulai patroli",
                  duration: 1000,
                  position: "bottom",
                  color: "dark",
                });
                await toast.present();

                setTimeout(() => {
                  loading.value = false;
                  location.href = "/tabs/tab1";
                }, 2000);
              } catch (e) {
                loading.value = false;
                console.log(e);
              }
            },
          },
        ],
      });
      await alert.present();
    };

    const endPatrol = async () => {
      const alert = await alertController.create({
        header: "Anda yakin?",
        message: "Anda yakin ingin mengakhiri giat patroli?",
        buttons: [
          {
            text: "Batal",
            role: "cancel",
          },
          {
            text: "Akhiri",
            role: "confirm",
            handler: async () => {
              loading.value = true;
              try {
                await apiUsePatroli.end_patrol({
                  id: parseInt(props.item.id),
                });

                const toast = await toastController.create({
                  message: "Berhasil mengakhiri patroli",
                  duration: 1000,
                  position: "bottom",
                  color: "dark",
                });
                await toast.present();

                setTimeout(() => {
                  loading.value = false;
                  location.href = "/tabs/tab1";
                }, 2000);
              } catch (e) {
                loading.value = false;
                console.log(e);
              }
            },
          },
        ],
      });
      await alert.present();
    };

    return {
      startPatrol,
      endPatrol,
      loading,
      moment,
    };
  },
});
</script>
