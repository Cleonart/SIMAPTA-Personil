<template>
  <ion-grid class="header ion-padding-horizontal">
    <ion-row class="header-chip">
      <ion-col size="1" class="ion-align-self-center">
        <img
          style="width: 18px; margin-left: 1.5rem"
          v-if="user.pangkat"
          alt="Rank"
          :src="translate[user.pangkat].img"
        />
      </ion-col>
      <ion-col size="9" class="ion-align-self-center">
        <div class="title">
          <ion-text>
            <p class="name">
              <b v-if="user.nama_display">{{ user.nama_display }}</b>
            </p>
            <p class="rank" v-if="user.pangkat">
              {{ translate[user.pangkat].nama }}
            </p>
          </ion-text>
        </div>
      </ion-col>
      <ion-col size="2" class="ion-align-self-center">
        <ion-avatar class="ion-float-right">
          <img
            alt="Avatar"
            src="https://ionicframework.com/docs/demos/api/avatar/avatar.svg"
          />
        </ion-avatar>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script>
import { defineComponent, onMounted, onUpdated, ref } from "vue";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import translate from "@/core/translate";

export default defineComponent({
  components: {
    IonGrid,
    IonRow,
    IonCol,
  },
  props: ["user"],
  setup(props) {
    return {
      translate,
    };
  },
});
</script>

<style scoped>
.header {
  margin-top: 15px;
}

.header .header-chip {
  background: #1e1e20;
  border-radius: 50px;
  color: white;
}

.header ion-avatar {
  height: 3.3rem;
  width: 3.3rem;
}

.header .title {
  margin-left: 1.4rem;
}

.title p {
  margin-bottom: 0px;
}

.header .title .name {
  margin-top: 0;
  font-size: 0.9rem;
}

.title .rank {
  margin-top: 6px;
  font-size: 0.8rem;
  opacity: 0.7;
}

ion-page {
  background-color: #283144;
}
</style>
