const fs = require('fs');
const path = require('path');

/**
 * Este script corrige problemas comuns de configuração do Gradle em projetos Expo/React Native
 * para Android. Ele é executado antes do build para garantir compatibilidade.
 */

// Função para fazer backup de um arquivo antes de modificá-lo
function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Backup criado: ${backupPath}`);
  }
}

// Função principal
async function fixGradleIssues() {
  console.log('Iniciando correções no Gradle...');

  try {
    // Primeiro executamos o prebuild para garantir que a pasta android exista
    const { execSync } = require('child_process');
    console.log('Executando expo prebuild para criar pasta android...');
    execSync('npx expo prebuild -p android', { stdio: 'inherit' });

    const androidDir = path.join(__dirname, 'android');
    
    // Verifica se a pasta android foi criada
    if (!fs.existsSync(androidDir)) {
      console.error('Pasta android não encontrada. O prebuild falhou?');
      process.exit(1);
    }

    // Corrige o arquivo gradle.properties
    const gradlePropsPath = path.join(androidDir, 'gradle.properties');
    if (fs.existsSync(gradlePropsPath)) {
      backupFile(gradlePropsPath);
      
      let gradleProps = fs.readFileSync(gradlePropsPath, 'utf8');
      
      // Adiciona ou atualiza propriedades importantes
      const propsToAdd = {
        'org.gradle.jvmargs': '-Xmx2048m -Dfile.encoding=UTF-8',
        'android.useAndroidX': 'true',
        'android.enableJetifier': 'true',
        'org.gradle.configureondemand': 'true',
        'org.gradle.parallel': 'true',
        'FLIPPER_VERSION': '0.125.0', // Versão atualizada do Flipper
      };
      
      // Adiciona cada propriedade se não existir
      for (const [key, value] of Object.entries(propsToAdd)) {
        const propRegex = new RegExp(`^${key}=.*$`, 'm');
        if (gradleProps.match(propRegex)) {
          gradleProps = gradleProps.replace(propRegex, `${key}=${value}`);
        } else {
          gradleProps += `\n${key}=${value}`;
        }
      }
      
      fs.writeFileSync(gradlePropsPath, gradleProps);
      console.log('gradle.properties atualizado com sucesso');
    }

    // Corrige o arquivo build.gradle principal
    const buildGradlePath = path.join(androidDir, 'build.gradle');
    if (fs.existsSync(buildGradlePath)) {
      backupFile(buildGradlePath);
      
      let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
      
      // Atualiza a versão do Gradle
      if (buildGradle.includes('classpath("com.android.tools.build:gradle:')) {
        buildGradle = buildGradle.replace(
          /classpath\("com.android.tools.build:gradle:[^"]+"\)/g,
          'classpath("com.android.tools.build:gradle:7.4.2")'
        );
      }
      
      fs.writeFileSync(buildGradlePath, buildGradle);
      console.log('build.gradle atualizado com sucesso');
    }
    
    console.log('Correções do Gradle concluídas com sucesso!');
  } catch (error) {
    console.error('Erro ao corrigir arquivos do Gradle:', error);
    process.exit(1);
  }
}

// Executa a função principal
fixGradleIssues();
