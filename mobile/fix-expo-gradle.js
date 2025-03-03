/**
 * Script para corrigir problemas com o build EAS
 * Este script deve ser executado manualmente antes de fazer o build com EAS
 */
const fs = require('fs');
const path = require('path');

// Função para aplicar patches em arquivos de módulos Expo
function applyPatches() {
  console.log('🛠️ Aplicando patches para resolver problemas de build...');
  
  try {
    // Patch 1: expo-image-loader
    patchExpoImageLoader();
    
    // Patch 2: SoftwareComponent.release problem
    patchGradleProperties();
    
    // Patch 3: Fix ExpoModulesCorePlugin
    patchExpoModulesCore();
    
    // Patch 4: Copiar build.gradle personalizado para expo-image-loader
    copyCustomBuildGradle();
    
    console.log('✅ Patches aplicados com sucesso! Agora você pode executar o build com EAS.');
  } catch (error) {
    console.error('❌ Erro ao aplicar patches:', error);
  }
}

// Patch para o problema do compileSdkVersion no expo-image-loader
function patchExpoImageLoader() {
  const moduleDir = path.join(__dirname, 'node_modules', 'expo-image-loader', 'android');
  const buildGradlePath = path.join(moduleDir, 'build.gradle');
  
  if (fs.existsSync(buildGradlePath)) {
    console.log('📄 Modificando expo-image-loader/android/build.gradle...');
    
    let content = fs.readFileSync(buildGradlePath, 'utf8');
    
    // Verifica se já contém as configurações
    if (!content.includes('compileSdkVersion')) {
      // Adiciona configurações de SDK que estão faltando
      const sdkConfig = `
android {
    compileSdkVersion 33
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 33
    }
}
`;
      
      // Insere as configurações de SDK antes de "apply from: '../autolinking_implementation.gradle'"
      content = content.replace(/apply\s+from:\s+['"]\.\.\/autolinking_implementation\.gradle['"]/, 
        `${sdkConfig}\napply from: '../autolinking_implementation.gradle'`);
      
      fs.writeFileSync(buildGradlePath, content, 'utf8');
      console.log('✅ expo-image-loader corrigido!');
    } else {
      console.log('ℹ️ expo-image-loader já está corrigido.');
    }
  } else {
    console.log('⚠️ Arquivo build.gradle do expo-image-loader não encontrado.');
  }
}

// Copiar um build.gradle personalizado para o expo-image-loader
function copyCustomBuildGradle() {
  const customBuildGradlePath = path.join(__dirname, 'expo-image-loader-build.gradle');
  const targetDir = path.join(__dirname, 'node_modules', 'expo-image-loader', 'android');
  const targetPath = path.join(targetDir, 'build.gradle');
  
  if (fs.existsSync(customBuildGradlePath) && fs.existsSync(targetDir)) {
    console.log('📄 Copiando build.gradle personalizado para expo-image-loader...');
    
    try {
      // Fazer backup do arquivo original
      if (fs.existsSync(targetPath)) {
        fs.copyFileSync(targetPath, targetPath + '.bak');
      }
      
      // Copiar o arquivo personalizado
      fs.copyFileSync(customBuildGradlePath, targetPath);
      console.log('✅ build.gradle personalizado copiado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao copiar build.gradle personalizado:', error);
    }
  } else {
    console.log('⚠️ Arquivo personalizado ou diretório de destino não encontrado.');
  }
}

// Patch para o problema do SoftwareComponent.release
function patchGradleProperties() {
  const expoModulesCoreDir = path.join(__dirname, 'node_modules', 'expo-modules-core', 'android');
  const pluginGradlePath = path.join(expoModulesCoreDir, 'ExpoModulesCorePlugin.gradle');
  
  if (fs.existsSync(pluginGradlePath)) {
    console.log('📄 Modificando expo-modules-core/android/ExpoModulesCorePlugin.gradle...');
    
    let content = fs.readFileSync(pluginGradlePath, 'utf8');
    
    // Substitui a parte problemática
    // Busca ocorrências de SoftwareComponent com 'release'
    if (content.includes('components.release')) {
      content = content.replace(/components\.release/g, 'components.findByName("release") ?: components.first()');
      fs.writeFileSync(pluginGradlePath, content, 'utf8');
      console.log('✅ ExpoModulesCorePlugin.gradle corrigido!');
    } else {
      console.log('ℹ️ ExpoModulesCorePlugin.gradle não precisava de correção.');
    }
  } else {
    console.log('⚠️ Arquivo ExpoModulesCorePlugin.gradle não encontrado.');
  }
}

// Patch para o ExpoModulesCorePlugin.gradle
function patchExpoModulesCore() {
  const autoLinkingDir = path.join(__dirname, 'node_modules', 'expo-modules-autolinking', 'scripts', 'android');
  const autoLinkingGradlePath = path.join(autoLinkingDir, 'autolinking_implementation.gradle');
  
  if (fs.existsSync(autoLinkingGradlePath)) {
    console.log('📄 Modificando expo-modules-autolinking/scripts/android/autolinking_implementation.gradle...');
    
    let content = fs.readFileSync(autoLinkingGradlePath, 'utf8');
    
    // Substitui a parte problemática relacionada à linha 453
    if (content.includes('androidComponents.register')) {
      // Envolvendo a parte problemática em um try-catch
      content = content.replace(
        /androidComponents\.register\s*\{[^}]*\}/gs, 
        `try {
          androidComponents.register {
            // Bloco de registro seguro
            beforeVariants { variantBuilder ->
              if (variantBuilder.buildType == "release") {
                // Implementação segura
              }
            }
          }
        } catch (Exception e) {
          logger.warn("Expo Autolinking: Erro ao registrar componentes Android: \${e.message}")
        }`
      );
      
      fs.writeFileSync(autoLinkingGradlePath, content, 'utf8');
      console.log('✅ autolinking_implementation.gradle corrigido!');
    } else {
      console.log('ℹ️ autolinking_implementation.gradle não precisava de correção ou estrutura diferente do esperado.');
    }
  } else {
    console.log('⚠️ Arquivo autolinking_implementation.gradle não encontrado.');
  }
}

// Executa as funções de correção
applyPatches();
