import mongoose from 'mongoose'

const IQFSchema = new mongoose.Schema({
   basal: {
      type: Number,
   },
   indicadors_universals: {
      matma: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      }
   },
   'indicadors_universals_(biosimilars)': {
      biosimilars: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      glargina: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
      },
      enoxaparina: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
      }
   },
   indicadors_dhiperprescripcio: {
      aines: {
         ddd: [Number],
         dhd: [Number],
         dhd_st: [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      condoprotectors: {
         ddd: [Number],
         dhd: [Number],
         dhd_st: [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      }, antiulcerosos: {
         ddd: [Number],
         dhd: [Number],
         dhd_st: [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      benzodiazepines: {
         ddd: [Number],
         dhd: [Number],
         dhd_st: [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      antibacterians: {
         ddd: [Number],
         dhd: [Number],
         dhd_st: [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      antiespasmodics: {
         ddd: [Number],
         dhd: [Number],
         dhd_st: [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      }
   },
   indicadors_de_seleccio_de_medicaments: {
      antihipertensius: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      ibp: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      osteoporosi: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      hipocolesterolemiants: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      antidepressius_1a_linia: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      antidepressius_2a_linia: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      mpoc_seleccio: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      hipoglucemiants_monoterapia_recomanada: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      },
      hipoglucemiants_biterapia_recomanada: {
         numerador: [Number],
         denominador: [Number],
         "%": [Number],
         puntuacio: [Number],
         plots: [{
            value: Number,
            label: String
         }]
      }
   }
});

export default IQFSchema;