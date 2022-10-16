<template>
  <ion-page>
    <ion-loading :is-open="loading"></ion-loading>
    <ion-content :fullscreen="true">
      <!-- [START] Modal for OTP -->
      <ion-modal ref="modal" trigger="open-modal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Gunakan OTP</ion-title>
            <ion-buttons slot="end">
              <ion-button :strong="true" @click="cancel()">Batal</ion-button>
              <ion-button :strong="true" @click="confirm()">
                Konfirmasi
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Masukan Token</ion-label>
            <ion-input
              v-model="token"
              ref="input"
              type="text"
              placeholder="Kode Token"
            ></ion-input>
          </ion-item>
        </ion-content>
      </ion-modal>
      <!-- [END] Modal for OTP -->

      <video id="videoRef" ref="videoRef"></video>
      <canvas ref="canvasRef" id="canvas" hidden></canvas>

      <div class="video-bottom">
        <div class="otp">
          <ion-grid>
            <ion-row>
              <ion-col size="8" class="ion-align-self-center">
                <h3>Absensi Digital</h3>
                <p>Tidak bisa menggunakan scanner?</p>
              </ion-col>
              <ion-col class="ion-align-self-center">
                <div class="ion-float-right">
                  <ion-button id="open-modal">Pakai OTP</ion-button>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import jsQr from "jsqr";
import apiUseAbsensi from "@/api/useAbsensi";
import {
  IonPage,
  IonContent,
  IonButton,
  IonModal,
  IonTitle,
  IonInput,
  IonLabel,
  IonLoading,
  toastController,
} from "@ionic/vue";

export default defineComponent({
  name: "Tab2Page",
  components: {
    IonContent,
    IonPage,
    IonButton,
    IonModal,
    IonTitle,
    IonInput,
    IonLabel,
    IonLoading,
  },
  setup() {
    const modal = ref();
    const videoRef = ref();
    const canvasElem = ref();
    const loading = ref(false);
    const canScan = ref(true);
    const token = ref();

    const showWelcomeMessage = async () => {
      setTimeout(async () => {
        const toast = await toastController.create({
          message: "Silahkan mendekatkan perangkat anda ke kode QR",
          duration: 1500,
          position: "bottom",
          color: "dark",
        });
        await toast.present();
      }, 500);
    };

    onMounted(async () => {
      canvasElem.value = document.getElementById("canvas");
      await showWelcomeMessage();
      startScan();
    });

    const startScan = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.value.srcObject = stream;
      videoRef.value.setAttribute("playsinline", true);
      videoRef.value.play();
      requestAnimationFrame(resetScan);
    };

    const getImage = () => {
      const canvas = canvasElem.value.getContext("2d");
      if (videoRef.value.readyState == videoRef.value.HAVE_ENOUGH_DATA) {
        canvasElem.value.height = videoRef.value.videoHeight;
        canvasElem.value.width = videoRef.value.videoWidth;
        canvas.drawImage(
          videoRef.value,
          0,
          0,
          canvasElem.value.width,
          canvasElem.value.height
        );

        return canvas.getImageData(
          0,
          0,
          canvasElem.value.width,
          canvasElem.value.height
        );
      }

      return undefined;
    };

    const processScan = async (code) => {
      try {
        await apiUseAbsensi.absenViaQr({
          kodeQr: code.data,
          token: localStorage.getItem("refresh_token"),
        });
        canScan.value = false;
        setTimeout(async () => {
          const toast = await toastController.create({
            message: "Anda berhasil melakukan absensi",
            duration: 4000,
            position: "bottom",
            color: "dark",
          });
          await toast.present();
          loading.value = false;
        }, 2000);
        setTimeout(() => {
          canScan.value = true;
        }, 5000);
      } catch (e) {
        console.log(e);
        canScan.value = false;
        setTimeout(async () => {
          loading.value = false;
          const toast = await toastController.create({
            message:
              "Gagal saat melakukan absensi, token salah atau proses absensi gagal",
            duration: 4000,
            position: "bottom",
            color: "dark",
          });
          await toast.present();
        }, 2000);
        setTimeout(() => {
          canScan.value = true;
        }, 5000);
      }
    };

    const resetScan = async () => {
      const imageData = getImage();
      if (imageData) {
        const code = jsQr(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          loading.value = true;
          if (canScan.value) {
            await processScan(code);
          }
        }
      }
      requestAnimationFrame(resetScan);
    };

    const stopScan = () => {
      const video = canvasElem.value.getContext("2d");
      video.stop();
    };

    const cancel = () => {
      modal.value.$el.dismiss(null, "cancel");
    };

    const confirm = async () => {
      try {
        loading.value = true;
        await apiUseAbsensi.absenViaToken({
          absent_token: token.value,
          jwt_token: localStorage.getItem("device_id"),
        });
        setTimeout(async () => {
          const toast = await toastController.create({
            message: "Anda berhasil melakukan absensi",
            duration: 4000,
            position: "bottom",
            color: "dark",
          });
          await toast.present();
          loading.value = false;
        }, 2000);
        setTimeout(() => {
          canScan.value = true;
        }, 5000);
      } catch (e) {
        console.log(e);
        canScan.value = false;
        setTimeout(async () => {
          loading.value = false;
          const toast = await toastController.create({
            message:
              "Gagal saat melakukan absensi, token salah atau anda sudah melakukan absensi",
            duration: 4000,
            position: "bottom",
            color: "dark",
          });
          await toast.present();
        }, 2000);
        setTimeout(() => {
          location.href = "/tabs/tab1";
        }, 4000);
      }
    };

    return {
      startScan,
      stopScan,
      cancel,
      confirm,
      loading,
      videoRef,
      modal,
      token,
    };
  },
});
</script>

<style scoped>
#videoRef {
  height: 85%;
  background-color: #d5d5d5;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.otp h3 {
  margin-bottom: 5px;
}

.otp p {
  opacity: 0.6;
  font-size: 0.9rem;
  margin-top: 0px;
}
</style>
