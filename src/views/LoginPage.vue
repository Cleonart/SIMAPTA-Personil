<template>
  <ion-page>
    <ion-loading :is-open="isLoading"></ion-loading>
    <ion-content fullscreen="true" class="ion-padding-horizontal">
      <div style="display: flex; margin-top: 2rem">
        <img src="@/assets/img/polda.png" style="width: 60px; height: auto" />
        <img
          src="@/assets/img/samapta.png"
          style="margin-left: 0.5rem; width: 60px; height: auto"
        />
      </div>

      <h1 style="font-size: 2rem">Masuk</h1>
      <p
        style="
          margin-top: 0;
          font-size: 1rem;
          opacity: 0.6;
          line-height: 1.4rem;
        "
      >
        Silahkan memasukan nama pengguna dan kata sandi anda
      </p>
      <ion-item>
        <ion-label position="stacked">Nama Pengguna</ion-label>
        <ion-input v-model="username"></ion-input>
      </ion-item>
      <ion-item class="ion-margin-top">
        <ion-label position="stacked">Kata Sandi</ion-label>
        <ion-input type="password" v-model="password"></ion-input>
      </ion-item>
      <ion-button
        :disabled="username == '' || password == '' || password.length < 8"
        @click="login"
        class="ion-margin-top"
        >Masuk</ion-button
      >
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonLabel,
  IonInput,
  IonItem,
  IonLoading,
  toastController,
} from "@ionic/vue";
import { defineComponent, onMounted, ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import api from "../api/auth";

export default defineComponent({
  components: { IonLabel, IonInput, IonItem, IonLoading },
  setup() {
    const username = ref("");
    const password = ref("");
    const isLoading = ref("");

    onMounted(() => {
      const uuidDevice = localStorage.getItem("device_id");
      if (uuidDevice == null || uuidDevice == undefined) {
        localStorage.setItem("device_id", uuidv4());
      }
    });

    const login = async () => {
      try {
        isLoading.value = true;
        const loginCred = await api.login(
          username.value,
          md5(password.value),
          localStorage.getItem("device_id")
        );

        const accessToken = loginCred.data.accessToken;
        localStorage.setItem("refresh_token", accessToken);

        // * Show the toast and notification
        setTimeout(async () => {
          const toast = await toastController.create({
            message: "Login berhasil, mengarahkan ke menu utama",
            duration: 1500,
            position: "bottom",
            color: "dark",
          });
          await toast.present();
        }, 1000);

        //* Loading setter and redirect
        setTimeout(async () => {
          location.href = "./tabs/tab1";
          isLoading.value = false;
        }, 2000);
      } catch (e) {
        if (e.response) {
          const toast = await toastController.create({
            message: e.response.data.msg,
            duration: 1500,
            position: "bottom",
            color: "dark",
          });
          isLoading.value = false;
          await toast.present();
        }
      }
    };

    return {
      username,
      password,
      isLoading,
      login,
    };
  },
});
</script>