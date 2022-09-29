<template>
  <section>
    <!-- [START] Modal for OTP -->
    <ion-modal ref="modalFinding" trigger="open-finding-modal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Tambahkan Temuan</ion-title>
          <ion-buttons slot="end">
            <ion-button :strong="true" @click="cancel()">Batal</ion-button>
            <ion-button :strong="true" @click="confirm()">
              Konfirmasi
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="ion-padding-horizontal">
          <p style="color: white; margin-bottom: 5px">
            Nomor Patroli : <b>{{ item.nomor_patroli }}</b>
          </p>
          <p style="margin-top: 5px">
            Tanggal Pelaporan :
            {{ renderDateFullFormat(finding.tanggal) }}
          </p>
        </div>
        <ion-item-divider style="min-height: 10px; border-width: 5px">
        </ion-item-divider>
        <div class="ion-padding">
          <ion-item class="ion-margin-top">
            <ion-label position="stacked">Kejadian yang ditemukan</ion-label>
            <ion-textarea
              placeholder="Ex. Anggota patroli menemukan..."
              :autoGrow="true"
              v-model="finding.kejadian_ditemukan"
            ></ion-textarea>
          </ion-item>
          <ion-item class="ion-margin-top">
            <ion-label position="stacked">Uraian singkat kejadian</ion-label>
            <ion-textarea
              placeholder="Ex. Anggota patroli kemudian menemukan..."
              :autoGrow="true"
              v-model="finding.uraian_kejadian"
            ></ion-textarea>
          </ion-item>
          <ion-item class="ion-margin-top">
            <ion-label position="stacked">Tindakan yang dilakukan</ion-label>
            <ion-textarea
              placeholder="Ex. Adapun tindakan yang dilakukan anggota patroli ..."
              :autoGrow="true"
              v-model="finding.tindakan_dilakukan"
            ></ion-textarea>
          </ion-item>
        </div>
      </ion-content>
    </ion-modal>

    <!-- [END] Modal for OTP -->
    <ion-loading :is-open="loading"></ion-loading>

    <!-- Patroli -->
    <ion-item class="patrol-card">
      <ion-label>
        <p style="color: white">
          Nomor Patroli : <b>{{ item.nomor_patroli }}</b>
        </p>
        <p>
          Tanggal Rencana :
          {{ renderDateFullFormat(item.tanggal_rencana_patroli) }}
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
            <ion-button id="open-finding-modal" size="small" color="primary">
              Tambahkan Temuan
            </ion-button>
          </div>
        </div>
      </ion-label>
    </ion-item>
  </section>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import {
  IonItem,
  IonLabel,
  IonChip,
  IonButton,
  IonLoading,
  IonModal,
  IonTextarea,
  alertController,
  toastController,
} from "@ionic/vue";
import moment from "moment-timezone";
import apiUsePatroli from "@/api/usePatroli";
import apiUseLaporan from "@/api/useLaporan";

export default defineComponent({
  components: {
    IonItem,
    IonLabel,
    IonChip,
    IonButton,
    IonLoading,
    IonModal,
    IonTextarea,
  },
  props: ["item"],
  setup(props) {
    // * Get time and date
    const waktu_sekarang = moment().tz("Asia/Makassar");
    const jam_sekarang = waktu_sekarang.format("H:m");
    const tanggal_sekarang = waktu_sekarang.format("YYYY-MM-DD");

    // * Utility and data variables
    const loading = ref(false);
    const modalFinding = ref({});
    const kejadian = ref("");
    const kejadianRef = ref();
    const finding = ref({
      tipe: "patroli",
      tanggal: new Date(tanggal_sekarang),
      waktu: jam_sekarang,
      patroli_id: props.item.id,
      surat_tugas_personil_id: props?.item?.surat_tugas?.daftar_personil[0].id,
      kejadian_ditemukan: "",
      uraian_kejadian: "",
      tindakan_dilakukan: "",
    });

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
                //* Communicate with API
                await apiUsePatroli.start_patrol({
                  id: parseInt(props.item.id),
                });

                // * Show toast at the end of action
                const toast = await toastController.create({
                  message: "Berhasil memulai patroli",
                  duration: 1000,
                  position: "bottom",
                  color: "dark",
                });
                await toast.present();

                //* Set the loading to false
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
                // * Communicate with API
                await apiUsePatroli.end_patrol({
                  id: parseInt(props.item.id),
                });

                // * Show toast at the end of action
                const toast = await toastController.create({
                  message: "Berhasil mengakhiri patroli",
                  duration: 1000,
                  position: "bottom",
                  color: "dark",
                });
                await toast.present();

                // * Set the loading to false
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

    const cancel = () => {
      modalFinding.value.$el.dismiss(null, "cancel");
    };

    const confirm = async () => {
      loading.value = true;
      try {
        await apiUseLaporan.create({
          data: finding.value,
        });

        setTimeout(async () => {
          loading.value = false;
          modalFinding.value.$el.dismiss(null, "cancel");

          // * Show toast at the end of action
          const toast = await toastController.create({
            message: "Laporan temuan berhasil didaftarkan",
            duration: 1000,
            position: "bottom",
            color: "dark",
          });
          await toast.present();
        }, 2000);
      } catch (e) {
        loading.value = false;
      }
    };

    const renderDateFullFormat = (date_convert) => {
      return moment(date_convert).format("DD MMMM YYYY");
    };

    return {
      startPatrol,
      endPatrol,
      renderDateFullFormat,
      cancel,
      confirm,
      finding,
      kejadian,
      kejadianRef,
      modalFinding,
      loading,
      moment,
    };
  },
});
</script>

<style scoped>
.patrol-card {
  margin-bottom: 10px;
  border-radius: 5px;
}
</style>