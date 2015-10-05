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
          cwd    : 'src/sass',
          src    : ['**/*.sass'],
          dest   : 'src/css',
          ext    : '.css'
        }]
      }
    },
    watch : {
      styles : {
        files : [ 'src/sass/**/*.sass' ],
        tasks : [ 'sass' ]
      }
    }
  } );

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['watch']);

}
