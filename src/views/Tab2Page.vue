<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- [START] Modal for OTP -->
      <ion-modal ref="modal" trigger="open-modal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Gunakan OTP</ion-title>
            <ion-buttons slot="end">
              <ion-button :strong="true" @click="cancel()">Batal</ion-button>
              <ion-button :strong="true" @click="confirm()"
                >Konfirmasi</ion-button
              >
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="stacked">Masukan Token</ion-label>
            <ion-input
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

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref } from "vue";
import jsQr from "jsqr";
import { IonPage, IonContent, IonButton } from "@ionic/vue";
import { IonModal, IonTitle, IonInput, IonLabel } from "@ionic/vue";

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
  },
  setup() {
    const modal = ref();
    const videoRef = ref();
    const canvasElem = ref();

    onMounted(() => {
      canvasElem.value = document.getElementById("canvas");
      startScan();
    });

    const startScan = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      videoRef.value.srcObject = stream;
      videoRef.value.setAttribute("playsinline", true);
      videoRef.value.play();
      requestAnimationFrame(tick);
    };

    const tick = () => {
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
        var imageData = canvas.getImageData(
          0,
          0,
          canvasElem.value.width,
          canvasElem.value.height
        );
        var code = jsQr(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code && code.data) {
          alert("CODE " + code);
        }
      }
      requestAnimationFrame(tick);
    };

    const stopScan = () => {
      const video = canvasElem.value.getContext("2d");
      video.stop();
    };

    const cancel = () => {
      modal.value.$el.dismiss(null, "cancel");
    };

    return {
      startScan,
      stopScan,
      cancel,
      videoRef,
      modal,
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
