module.exports = function( grunt ) {
  
  grunt.initConfig( {
    less : {
      development : {
        options : {
          compress     : true,
          yuicompress  : true,
          optimization : 2
        },
        files : {
          'src/css/main.css'   : 'src/less/main.less',
          'src/css/resume.css' : 'src/less/resume.less'
        }
      }
    },
    watch : {
      styles : {
        files : [ 'src/less/**/*.less' ],
        tasks : [ 'less' ],
        options : {
          nospawn : true
        }
      }
    }
  } );

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
 
  grunt.registerTask('default', ['less']);

}