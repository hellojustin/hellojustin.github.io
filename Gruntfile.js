module.exports = function( grunt ) {

  grunt.initConfig( {
    sass : {
      dist : {
        options : {
          compass : true,
          bundleExec : true
        },
        files : [{
          expand : true,
          cwd    : 'sass',
          src    : ['**/*.sass'],
          dest   : 'css',
          ext    : '.css'
        }]
      }
    },
    watch : {
      styles : {
        files : [ 'sass/**/*.sass' ],
        tasks : [ 'sass' ]
      }
    }
  } );

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['watch']);

}
