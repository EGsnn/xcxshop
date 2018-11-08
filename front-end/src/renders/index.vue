<template>
    <div id="app">
        <router-view v-if="isRouterAlive"></router-view>
    </div>
</template>

<script>

    export default {
        name: 'index',
        provide(){
            return {
                reload:this.reload
            }
        },
        data(){
            return{
                isRouterAlive:true
            }
        },
        methods:{
            reload(){
                this.isRouterAlive = false;
                this.$nextTick(function(){
                    this.isRouterAlive = true;
                })
            }
        },
        created () {
            this.func.ajaxGet(this.api.userAutoLogin, res => {
                if (res.data.code === 200) {
                    this.$store.commit('user', res.data.user);
                } else {
                    this.$router.push('/');
                }
            });
        },
    }
</script>