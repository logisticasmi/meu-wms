// =====================================================
// SMI WMS - CONEXÃO COM O SUPABASE
// =====================================================

const SUPABASE_URL =
    "https://uhohxtudadntbbsjeejv.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_SX-t8e_Wywi-4zH31BcIIg_B-OAdHV6";

if (
    typeof window.supabase === "undefined"
) {
    console.error(
        "A biblioteca do Supabase não foi carregada."
    );
} else {
    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

    console.log(
        "Supabase conectado com sucesso."
    );
}