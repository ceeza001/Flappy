import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const FlappyBirdGame = ({ onGameOver }) => {
  const gameContainer = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 600 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    let game = new Phaser.Game({ ...config, parent: gameContainer.current });

    let isGameOver = false;
    let score = 0;
    let scoreText;
    let isRefresh = false;
    let hitPlayed = false;
    let diePlayed = false;
    let character;
    let base;
    let baseImage;
    let baseHeight;
    let baseWidth;
    let speed = -150;
    let spawnTime = 1500;
    let gameStart = false;

    function preload() {
      this.load.image('background', 'assets/GameObjects/background-day.png');
      this.load.image('character1', 'assets/GameObjects/yellowbird-midflap.png');
      this.load.image('character2', 'assets/GameObjects/yellowbird-downflap.png');
      this.load.image('character3', 'assets/GameObjects/yellowbird-upflap.png');
      this.load.image('character4', 'assets/GameObjects/yellowbird-fall.png');
      this.load.image('pillar', 'assets/GameObjects/pipe-green.png');
      this.load.image('base', 'assets/GameObjects/base.png');
      this.load.image('gameover', 'assets/UI/gameover.png');
      this.load.image('score', 'assets/UI/score.png');
      this.load.image('retry', 'assets/UI/retry.png');
      this.load.image('startGame', 'assets/UI/message.png');
      this.load.audio('score', 'assets/SoundEffects/point.wav');
      this.load.audio('hit', 'assets/SoundEffects/hit.wav');
      this.load.audio('wing', 'assets/SoundEffects/wing.wav');
      this.load.audio('die', 'assets/SoundEffects/die.wav');
    }

    function create() {
      let background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'background');
      background.setOrigin(0, 0);
      background.displayWidth = this.sys.game.config.width;
      background.displayHeight = this.sys.game.config.height;

      baseImage = this.textures.get('base');
      baseHeight = baseImage.getSourceImage().height;
      baseWidth = window.innerWidth;
      base = this.add.tileSprite(game.config.width / 2, game.config.height - baseHeight / 2, baseWidth, baseHeight, 'base');
      this.physics.add.existing(base, true);
      base.setDepth(1);

      let startGameImage = this.add.image(game.config.width / 2, game.config.height / 3, 'startGame');
      startGameImage.setOrigin(0.5, 0.5);

      character = this.physics.add.sprite(game.config.width / 4, game.config.height / 2, 'character1');
      character.setDepth(1);
      character.setCollideWorldBounds(true);
      character.body.allowGravity = false;
      gameStart = false;

      this.anims.create({
        key: 'fly',
        frames: [
          { key: 'character1' },
          { key: 'character2' },
          { key: 'character3' },
        ],
        frameRate: 9,
        repeat: -1,
      });

      this.anims.create({
        key: 'fall',
        frames: [{ key: 'character4' }],
        frameRate: 9,
        repeat: -1,
      });

      character.anims.play('fly', true);

      this.input.on(
        'pointerdown',
        function (pointer) {
          if (gameStart) return;
          gameStart = true;
          startGameImage.setVisible(false);
          character.body.allowGravity = true;
          this.upperPillars = this.physics.add.group();
          this.lowerPillars = this.physics.add.group();
          this.spawnPillarPair();
          this.physics.add.collider(character, this.upperPillars, hitPillar, null, this);
          this.physics.add.collider(character, this.lowerPillars, hitPillar, null, this);
          this.physics.add.collider(character, base, hitBase, null, this);

          scoreText = this.add.text(game.config.width / 2, 30, '0', {
            fontSize: '32px',
            fontFamily: 'Fantasy',
            fill: 'white',
          });
          scoreText.setOrigin(0.5, 0.5);
          scoreText.setDepth(1);

          this.point = this.sound.add('score');
          this.hit = this.sound.add('hit');
          this.wing = this.sound.add('wing');
          this.die = this.sound.add('die');

          this.input.on(
            'pointerdown',
            function (pointer) {
              if (!isRefresh && !isGameOver) {
                this.wing.play();
                character.setVelocityY(-230);
              }
              isRefresh = false;
            },
            this
          );
        },
        this
      );
    }

    function update() {
      if (!isGameOver) base.tilePositionX += 1;
      if (!gameStart) return;

      let scoreIncremented = false;
      [this.upperPillars, this.lowerPillars].forEach((group) => {
        group.children.iterate((pillar) => {
          if (!pillar) return;

          if (!pillar.hasPassed && pillar.x + pillar.width < character.x) {
            pillar.hasPassed = true;
            if (!scoreIncremented) {
              score++;
              scoreText.setText(score);
              this.point.play();
              scoreIncremented = true;
            }
          }
          if (pillar.x + pillar.width < 0) {
            pillar.destroy();
          }
        });
      });
      scoreIncremented = false;
      if (this.pillarSpawnTime < this.time.now && !isGameOver) {
        this.spawnPillarPair();
      }
    }

    Phaser.Scene.prototype.spawnPillarPair = function () {
      baseImage = this.textures.get('base');
      baseHeight = baseImage.getSourceImage().height;
      let pillarImage = this.textures.get('pillar');
      let pillarHeight = pillarImage.getSourceImage().height * 0.6;

      let minGapHeight = (1 / 4) * (game.config.height - baseHeight);
      let maxGapHeight = (1 / 3) * (game.config.height - baseHeight);

      let safeMaxUpperY = game.config.height - baseHeight - maxGapHeight - pillarHeight * 1.9;

      let upperY = Phaser.Math.Between(window.innerHeight * 0.2, safeMaxUpperY);
      let gapHeight = Phaser.Math.Between(minGapHeight, maxGapHeight);

      let lowerY = upperY + gapHeight + pillarHeight / 0.6;

      let upperPillar = this.upperPillars.create(game.config.width, upperY, 'pillar');
      upperPillar.setAngle(180);
      let lowerPillar = this.lowerPillars.create(game.config.width, lowerY, 'pillar');
      upperPillar.body.allowGravity = false;
      lowerPillar.body.allowGravity = false;

      upperPillar.setVelocityX(speed);
      lowerPillar.setVelocityX(speed);
      this.pillarSpawnTime = this.time.now + spawnTime;
    };

    function hitBase(character, base) {
      if (!hitPlayed) this.hit.play();
      character.anims.play('fall', true);
      base.body.enable = false;
      character.setVelocityX(0);
      character.setVelocityY(0);
      character.body.allowGravity = false;
      [this.upperPillars, this.lowerPillars].forEach((group) =>
        group.children.iterate((pillar) => (pillar.body.velocity.x = 0))
      );
      isGameOver = true;
      let gameOverImage = this.add.image(game.config.width / 2, game.config.height / 4, 'gameover');
      gameOverImage.setOrigin(0.5, 0.5);
      let scoreImage = this.add.image(game.config.width / 2, game.config.height, 'score');
      scoreImage.setOrigin(0.5, 0.5);
      let finalScoreText = this.add.text(game.config.width / 2, game.config.height, score, {
        fontSize: '32px',
        fontFamily: 'Fantasy',
        fill: 'white',
      });
      finalScoreText.setOrigin(0.5, 0.5);
      this.tweens.add({
        targets: [scoreImage, finalScoreText],
        y: function (target) {
          return target === scoreImage ? game.config.height / 2.2 : game.config.height / 2.1;
        },
        ease: 'Power1',
        duration: 500,
        repeat: 0,
        yoyo: false,
      });
      scoreText.destroy();

      setTimeout(() => {
        onGameOver(score); // Pass the score to the parent component
      }, 3000);
    }

    function hitPillar(character, pillar) {
      if (!hitPlayed && !diePlayed) {
        this.hit.play();
        this.die.play();
        hitPlayed = true;
        diePlayed = true;
      }
      character.anims.play('fall', true);
      pillar.body.enable = false;
      character.setVelocityX(0);
      [this.upperPillars, this.lowerPillars].forEach((group) =>
        group.children.iterate((pillar) => (pillar.body.velocity.x = 0))
      );
      isGameOver = true;

      setTimeout(() => {
        onGameOver(score); // Pass the score to the parent component
      }, 3000);
    }

    return () => {
      game.destroy(true);
    };
  }, [onGameOver]);

  return <div ref={gameContainer} style={{ width: '100vw', height: '100vh' }} />;
};

export default FlappyBirdGame;
